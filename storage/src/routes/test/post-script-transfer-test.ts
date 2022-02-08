import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { signedTransferActionFactory } from '../../test-factories/script-factories';
import { expect } from 'chai';
import { utils } from 'ethers';
import { TransferScript } from '../../models/transfer-script';
import { truncateAndEscapeText } from '../../models/utils';
import faker from '@faker-js/faker';

describe('POST api/scripts/transfer', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it('successfully adds a valid transfer script', async () => {
        const payload = signedTransferActionFactory({});

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(200);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script).to.not.be.null;
    });

    it('fails if payload is incomplete', async () => {
        // set type to 'any' so we can fool the type checker
        const payload: any = signedTransferActionFactory({});
        delete payload['signature'];

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(400);
    });

    it('fails if script ID is not unique', async () => {
        const payload = signedTransferActionFactory({ scriptId: '0x00' });

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(200);

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(400);
    });

    it('adds the checksum to the user address when it is saved', async () => {
        // whenever a script is saved, the user address should be checksum-med
        // 0x9a2f243c605e6908d96b18e21fb82bf288b19ef3 -> 0x9A2F243c605e6908D96b18e21Fb82Bf288B19EF3
        const payload = signedTransferActionFactory({ user: '0x9a2f243c605e6908d96b18e21fb82bf288b19ef3' });

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(200);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script.user).to.not.equal(payload.user);
        expect(script.user).to.equal(utils.getAddress(payload.user));
    });

    it('converts BigNumbers to strings', async () => {
        const payload = signedTransferActionFactory({ amount: utils.parseEther("3.55") });

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(200);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script.amount).to.not.equal(payload.amount);
        expect(script.amount).to.equal("3550000000000000000");
    });

    it('trims description to 150 characters', async () => {
        const payload = signedTransferActionFactory({ description: faker.random.words(200) });

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(200);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script?.description.length).to.be.lessThanOrEqual(150);
    });

    it('escapes dangerous characters from the description', async () => {
        const payload = signedTransferActionFactory({ description: '<script>window.location.href="dangerous-site"</script>' });

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(200);

        const script = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(script.description).to.be.equal(truncateAndEscapeText(payload.description));
    });
});
