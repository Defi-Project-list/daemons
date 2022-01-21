import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { swapScriptDocumentFactory, transferScriptDocumentFactory } from '../../test-factories/script-factories';
import { expect } from 'chai';
import { ISignedSwapAction } from '../../../../messages/definitions/swap-action-messages';
import { BigNumber } from 'ethers';


describe('GET api/scripts', () => {

    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it('returns an empty array if there are no scripts on the db', async () => {
        const chainId = "42";
        const response = await supertest(app).get(`/api/scripts/${chainId}`);
        const fetchedScripts = response.body as ISignedSwapAction[];

        expect(fetchedScripts.length).to.equal(0);
    });

    it('fetches all scripts', async () => {
        // add to the db some randomly generated scripts
        const swapScript1 = await swapScriptDocumentFactory({});
        const swapScript2 = await swapScriptDocumentFactory({});
        const transferScript1 = await transferScriptDocumentFactory({});
        const ids = [swapScript1.scriptId, swapScript2.scriptId, transferScript1.scriptId];

        const chainId = "42";
        const response = await supertest(app).get(`/api/scripts/${chainId}`);
        const fetchedScripts = response.body as ISignedSwapAction[];

        expect(fetchedScripts.length).to.equal(3);
        expect(ids).to.include(fetchedScripts[0].scriptId);
        expect(ids).to.include(fetchedScripts[1].scriptId);
        expect(ids).to.include(fetchedScripts[2].scriptId);
    });

    it('only fetches scripts with the given chain', async () => {
        // add to the db some scripts on the desired chain
        const swapScript = await swapScriptDocumentFactory({ chainId: BigNumber.from("42") });
        const transferScript = await transferScriptDocumentFactory({ chainId: BigNumber.from("42") });
        const ids = [swapScript.scriptId, transferScript.scriptId];

        // and some on other chains
        await transferScriptDocumentFactory({ chainId: BigNumber.from("1") });
        await swapScriptDocumentFactory({ chainId: BigNumber.from("2") });
        await swapScriptDocumentFactory({ chainId: BigNumber.from("16665") });

        const chainId = "42";
        const response = await supertest(app).get(`/api/scripts/${chainId}`);
        const fetchedScripts = response.body as ISignedSwapAction[];

        expect(fetchedScripts.length).to.equal(2);
        expect(ids).to.include(fetchedScripts[0].scriptId);
        expect(ids).to.include(fetchedScripts[1].scriptId);
    });
});
