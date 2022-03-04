import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import { Stats } from '../../models/stats';
import { transferScriptDocumentFactory } from '../../test-factories/script-factories';


describe('POST api/admin/update-stats', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it('successfully saves the stats', async () => {
        await supertest(app)
            .post("/api/admin/update-stats")
            .set('api_key', process.env.ADMIN_KEY!)
            .expect(200);

        const stats = await Stats.findOne({ date: new Date().toISOString().slice(0, 10) });
        expect(stats).to.not.be.null;
    });

    it('updates existing stats', async () => {
        // Adding first script
        await transferScriptDocumentFactory({ user: '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244' });

        await supertest(app)
            .post("/api/admin/update-stats")
            .set('api_key', process.env.ADMIN_KEY!)
            .expect(200);

        const statsBefore = await Stats.findOne({ date: new Date().toISOString().slice(0, 10) });
        expect(statsBefore?.totalScripts).to.equal(1);
        expect(statsBefore?.totalUsers).to.equal(1);

        // Adding second script
        await transferScriptDocumentFactory({ user: '0xb79f76ef2c5f0286176833e7b2eee103b1cc3245' });

        await supertest(app)
            .post("/api/admin/update-stats")
            .set('api_key', process.env.ADMIN_KEY!)
            .expect(200);

        const statsAfter = await Stats.findOne({ date: new Date().toISOString().slice(0, 10) });
        expect(statsAfter?.totalScripts).to.equal(2);
        expect(statsAfter?.totalUsers).to.equal(2);
    });
});
