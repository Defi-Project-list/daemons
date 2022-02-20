import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { signedSwapActionFactory } from '../../test-factories/script-factories';
import { expect } from 'chai';
import { utils } from 'ethers';
import { SwapScript } from '../../models/swap-script';
import faker from '@faker-js/faker';
import { truncateAndEscapeText } from '../../models/utils';
import jwt from 'jsonwebtoken';

describe('POST api/scripts/swap', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it('successfully adds a valid swap script', async () => {
        const payload = signedSwapActionFactory({ user: userAddress });

        await supertest(app)
            .post("/api/scripts/swap")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const script = await SwapScript.findOne({ scriptId: payload.scriptId });
        expect(script).to.not.be.null;
    });

    it('fails if payload is incomplete', async () => {
        // set type to 'any' so we can fool the type checker
        const payload: any = signedSwapActionFactory({ user: userAddress });
        delete payload['signature'];

        await supertest(app)
            .post("/api/scripts/swap")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(400);
    });

    it('fails if script ID is not unique', async () => {
        const payload = signedSwapActionFactory({ scriptId: '0x00', user: userAddress });

        await supertest(app)
            .post("/api/scripts/swap")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);

        await supertest(app)
            .post("/api/scripts/swap")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(400);
    });

    it('adds the checksum to the user address when it is saved', async () => {
        // whenever a script is saved, the user address should be checksum-med
        const payload = signedSwapActionFactory({ user: userAddress });

        await supertest(app)
            .post("/api/scripts/swap")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const script = await SwapScript.findOne({ scriptId: payload.scriptId });
        expect(script).is.not.null;
        expect(script!.user).to.not.equal(payload.user);
        expect(script!.user).to.equal(utils.getAddress(payload.user));
    });

    it('converts BigNumbers to strings', async () => {
        const payload = signedSwapActionFactory({ amount: utils.parseEther("3.55"), user: userAddress });

        await supertest(app)
            .post("/api/scripts/swap")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const script = await SwapScript.findOne({ scriptId: payload.scriptId });
        expect(script).is.not.null;
        expect(script!.amount).to.not.equal(payload.amount);
        expect(script!.amount).to.equal("3550000000000000000");
    });

    it('trims description to 150 characters', async () => {
        const payload = signedSwapActionFactory({ description: faker.random.words(200), user: userAddress });

        await supertest(app)
            .post("/api/scripts/swap")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const script = await SwapScript.findOne({ scriptId: payload.scriptId });
        expect(script?.description.length).to.be.lessThanOrEqual(150);
    });

    it('escapes dangerous characters from the description', async () => {
        const payload = signedSwapActionFactory({ description: '<script>window.location.href="dangerous-site"</script>', user: userAddress });

        await supertest(app)
            .post("/api/scripts/swap")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const script = await SwapScript.findOne({ scriptId: payload.scriptId });
        expect(script?.description).to.be.equal(truncateAndEscapeText(payload.description));
    });
});
