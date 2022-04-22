import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import supertest from "supertest";
import { app } from "../../app";
import { signedTransferActionFactory } from "../../test-factories/script-factories";
import { expect } from "chai";
import { utils } from "ethers";
import { TransferScript } from "../../models/scripts/transfer-script";
import { truncateAndEscapeText } from "../../models/utils";
import faker from "@faker-js/faker";
import jwt from "jsonwebtoken";

describe("POST api/scripts/transfer", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = "0xb79f76ef2c5f0286176833e7b2eee103b1cc3244";
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it("successfully adds a valid transfer script", async () => {
        const payload = signedTransferActionFactory({ user: userAddress });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "TransferScript" })
            .expect(200);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script).to.not.be.null;
    });

    it("fails if user is not authenticated", async () => {
        const payload = signedTransferActionFactory({ user: userAddress });

        await supertest(app)
            .post("/api/scripts/")
            .send({ script: payload, type: "TransferScript" })
            .expect(401);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script).to.be.null;
    });

    it("fails if user is trying to add a script for another user", async () => {
        const payload = signedTransferActionFactory({}); // will belong to a random user

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "TransferScript" })
            .expect(403);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script).to.be.null;
    });

    it("fails if payload is incomplete", async () => {
        // set type to 'any' so we can fool the type checker
        const payload: any = signedTransferActionFactory({ user: userAddress });
        delete payload["signature"];

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "TransferScript" })
            .expect(400);
    });

    it("fails if script ID is not unique", async () => {
        const payload = signedTransferActionFactory({ scriptId: "0x00", user: userAddress });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "TransferScript" })
            .expect(200);

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "TransferScript" })
            .expect(400);
    });

    it("adds the checksum to the user address when it is saved", async () => {
        // whenever a script is saved, the user address should be checksum-med
        const payload = signedTransferActionFactory({ user: userAddress });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "TransferScript" })
            .expect(200);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script.user).to.not.equal(payload.user);
        expect(script.user).to.equal(utils.getAddress(payload.user));
    });

    it("converts BigNumbers to strings", async () => {
        const payload = signedTransferActionFactory({
            amount: utils.parseEther("3.55"),
            user: userAddress
        });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "TransferScript" })
            .expect(200);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script.amount).to.not.equal(payload.amount);
        expect(script.amount).to.equal("3550000000000000000");
    });

    it("trims description to 150 characters", async () => {
        const payload = signedTransferActionFactory({
            description: faker.random.words(200),
            user: userAddress
        });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "TransferScript" })
            .expect(200);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script?.description.length).to.be.lessThanOrEqual(150);
    });

    it("escapes dangerous characters from the description", async () => {
        const payload = signedTransferActionFactory({
            description: '<script>window.location.href="dangerous-site"</script>',
            user: userAddress
        });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "TransferScript" })
            .expect(200);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script.description).to.be.equal(truncateAndEscapeText(payload.description));
    });
});
