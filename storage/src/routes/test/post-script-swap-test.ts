import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { signedSwapActionFactory } from '../../test-factories/script-factories';
import { expect } from 'chai';
import { utils } from 'ethers';
import { SwapScript } from '../../models/swap-script';

describe('POST api/scripts/swap', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it('successfully adds a valid swap script', async () => {
        const payload = signedSwapActionFactory({});

        await supertest(app)
            .post("/api/scripts/swap")
            .send(payload)
            .expect(200);

        const script = await SwapScript.findOne({ scriptId: payload.scriptId });
        expect(script).to.not.be.null;
    });

    it('fails if payload is incomplete', async () => {
        // set type to 'any' so we can fool the type checker
        const payload: any = signedSwapActionFactory({});
        delete payload['signature'];

        await supertest(app)
            .post("/api/scripts/swap")
            .send(payload)
            .expect(400);
    });

    it('fails if script ID is not unique', async () => {
        const payload = signedSwapActionFactory({ scriptId: '0x00' });

        await supertest(app)
            .post("/api/scripts/swap")
            .send(payload)
            .expect(200);

        await supertest(app)
            .post("/api/scripts/swap")
            .send(payload)
            .expect(400);
    });

    it('adds the checksum to the user address when it is saved', async () => {
        // whenever a script is saved, the user address should be checksum-med
        // 0x9a2f243c605e6908d96b18e21fb82bf288b19ef3 -> 0x9A2F243c605e6908D96b18e21Fb82Bf288B19EF3
        const payload = signedSwapActionFactory({ user: '0x9a2f243c605e6908d96b18e21fb82bf288b19ef3' });

        await supertest(app)
            .post("/api/scripts/swap")
            .send(payload)
            .expect(200);

        const script = await SwapScript.findOne({ scriptId: payload.scriptId });
        expect(script).is.not.null;
        expect(script!.user).to.not.equal(payload.user);
        expect(script!.user).to.equal(utils.getAddress(payload.user));
    });

    it('converts BigNumbers to strings', async () => {
        const payload = signedSwapActionFactory({ amount: utils.parseEther("3.55") });

        await supertest(app)
            .post("/api/scripts/swap")
            .send(payload)
            .expect(200);

        const script = await SwapScript.findOne({ scriptId: payload.scriptId });
        expect(script).is.not.null;
        expect(script!.amount).to.not.equal(payload.amount);
        expect(script!.amount).to.equal("3550000000000000000");
    });
});
