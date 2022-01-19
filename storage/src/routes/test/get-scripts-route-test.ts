import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { swapScriptDocumentFactory, transferScriptDocumentFactory } from '../../test/factories';
import { expect } from 'chai';
import { ISignedSwapAction } from '../../../../messages/definitions/swap-action-messages';


describe('GET api/scripts', () => {

    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it('returns an empty array if there are no scripts on the db', async () => {
        const response = await supertest(app).get("/api/scripts");
        const fetchedScripts = response.body as ISignedSwapAction[];

        expect(fetchedScripts.length).to.equal(0);
    });

    it('fetches all scripts', async () => {
        // add to the db some randomly generated scripts
        const swapScript1 = await swapScriptDocumentFactory({});
        const swapScript2 = await swapScriptDocumentFactory({});
        const transferScript1 = await transferScriptDocumentFactory({});
        const ids = [swapScript1.scriptId, swapScript2.scriptId, transferScript1.scriptId];

        const response = await supertest(app).get("/api/scripts");
        const fetchedScripts = response.body as ISignedSwapAction[];

        expect(fetchedScripts.length).to.equal(3);
        expect(ids).to.include(fetchedScripts[0].scriptId);
        expect(ids).to.include(fetchedScripts[1].scriptId);
        expect(ids).to.include(fetchedScripts[2].scriptId);
    });
});
