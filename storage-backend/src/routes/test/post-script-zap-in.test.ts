import { connectToTestDb, closeTestDb, clearTestDb } from "../../test/test-db-handler";
import supertest from "supertest";
import { app } from "../../app";
import { signedZapInActionFactory } from "@daemons-fi/db-schema";
import { expect } from "chai";
import { utils } from "ethers";
import { truncateAndEscapeText } from "@daemons-fi/db-schema";
import faker from "@faker-js/faker";
import jwt from "jsonwebtoken";
import { ZapInScript } from "@daemons-fi/db-schema";

describe("POST api/scripts/    [ZapIn]", () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = "0xb79f76ef2c5f0286176833e7b2eee103b1cc3244";
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it("successfully adds a valid zap-in script", async () => {
        const payload = signedZapInActionFactory({ user: userAddress });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "ZapInScript" })
            .expect(200);

        const script = await ZapInScript.findOne({ scriptId: payload.scriptId });
        expect(script).to.not.be.null;
    });

    it("fails if user is not authenticated", async () => {
        const payload = signedZapInActionFactory({ user: userAddress });

        await supertest(app)
            .post("/api/scripts/")
            .send({ script: payload, type: "ZapInScript" })
            .expect(401);

        const script = await ZapInScript.findOne({ scriptId: payload.scriptId });
        expect(script).to.be.null;
    });

    it("fails if user is trying to add a script for another user", async () => {
        const payload = signedZapInActionFactory({}); // will belong to a random user

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "ZapInScript" })
            .expect(403);

        const script = await ZapInScript.findOne({ scriptId: payload.scriptId });
        expect(script).to.be.null;
    });

    it("fails if payload is incomplete", async () => {
        // set type to 'any' so we can fool the type checker
        const payload: any = signedZapInActionFactory({ user: userAddress });
        delete payload["signature"];

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "ZapInScript" })
            .expect(400);
    });

    it("fails if script ID is not unique", async () => {
        const payload = signedZapInActionFactory({ scriptId: "0x00", user: userAddress });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "ZapInScript" })
            .expect(200);

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "ZapInScript" })
            .expect(400);
    });

    it("adds the checksum to the user address when it is saved", async () => {
        // whenever a script is saved, the user address should be checksum-med
        const payload = signedZapInActionFactory({ user: userAddress });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "ZapInScript" })
            .expect(200);

        const script = await ZapInScript.findOne({ scriptId: payload.scriptId });
        expect(script.user).to.not.equal(payload.user);
        expect(script.user).to.equal(utils.getAddress(payload.user));
    });

    it("converts BigNumbers to strings", async () => {
        const payload = signedZapInActionFactory({
            amountA: utils.parseEther("3.55"),
            user: userAddress
        });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "ZapInScript" })
            .expect(200);

        const script = await ZapInScript.findOne({ scriptId: payload.scriptId });
        expect(script.amountA).to.not.equal(payload.amountA);
        expect(script.amountA).to.equal("3550000000000000000");
    });

    it("trims description to 150 characters", async () => {
        const payload = signedZapInActionFactory({
            description: faker.random.words(200),
            user: userAddress
        });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "ZapInScript" })
            .expect(200);

        const script = await ZapInScript.findOne({ scriptId: payload.scriptId });
        expect(script?.description.length).to.be.lessThanOrEqual(150);
    });

    it("escapes dangerous characters from the description", async () => {
        const payload = signedZapInActionFactory({
            description: '<script>window.location.href="dangerous-site"</script>',
            user: userAddress
        });

        await supertest(app)
            .post("/api/scripts/")
            .set("Cookie", `token=${jwToken}`)
            .send({ script: payload, type: "ZapInScript" })
            .expect(200);

        const script = await ZapInScript.findOne({ scriptId: payload.scriptId });
        expect(script.description).to.be.equal(truncateAndEscapeText(payload.description));
    });
});
