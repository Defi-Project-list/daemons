import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import { UserStats } from '../../models/stats/user-stats';
import { ScriptStats } from '../../models/stats/script-stats';
import { transferScriptDocumentFactory } from '../../test-factories/script-factories';
import { transactionDocumentFactory } from '../../test-factories/transactions-factories';


describe('POST api/admin/update-stats', () => {
    before(async () => await connectToTestDb());
    beforeEach(async () => {
        await transferScriptDocumentFactory({ user: '0xb79f76ef2c5f0286176833e7b2eee103b1cc3243', chainId: "40" });
        await transferScriptDocumentFactory({ user: '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244', chainId: "42" });
        await transferScriptDocumentFactory({ user: '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244', chainId: "42" });

        await transactionDocumentFactory({ chainId: "40" });
        await transactionDocumentFactory({ chainId: "40" });
        await transactionDocumentFactory({ chainId: "42" });
    });
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it('successfully saves the stats', async () => {
        await supertest(app)
            .post("/api/admin/update-stats")
            .set('api_key', process.env.ADMIN_KEY!)
            .expect(200);

        const userStats = await UserStats.findOne({ date: new Date().toISOString().slice(0, 10) });
        expect(userStats).to.not.be.null;
        expect(userStats?.total).to.equal(2);
        const kovanUsers = userStats?.totalPerChain.find(t => t.name === "Kovan");
        expect(kovanUsers?.total).to.equal(1);

        const scriptStats = await ScriptStats.findOne({ date: new Date().toISOString().slice(0, 10) });
        expect(scriptStats).to.not.be.null;
        expect(scriptStats?.total).to.equal(3);
        expect(scriptStats?.totalExecutions).to.equal(3);
        const totalKovan = scriptStats?.totalPerChain.find(t => t.name === "Kovan");
        expect(totalKovan?.total).to.equal(2);
        const totalExecutionsKovan = scriptStats?.totalExecutionsPerChain.find(t => t.name === "Kovan");
        expect(totalExecutionsKovan?.total).to.equal(1);
    });

    it('updates existing stats', async () => {
        await supertest(app)
            .post("/api/admin/update-stats")
            .set('api_key', process.env.ADMIN_KEY!)
            .expect(200);

        // confirming first values
        const userStatsBefore = await UserStats.findOne({ date: new Date().toISOString().slice(0, 10) });
        expect(userStatsBefore?.total).to.equal(2);
        const totalKovanUsersBefore = userStatsBefore?.totalPerChain.find(t => t.name === "Kovan");
        expect(totalKovanUsersBefore?.total).to.equal(1);

        const scriptStatsBefore = await ScriptStats.findOne({ date: new Date().toISOString().slice(0, 10) });
        expect(scriptStatsBefore?.total).to.equal(3);
        expect(scriptStatsBefore?.totalExecutions).to.equal(3);
        const totalKovanScriptsBefore = scriptStatsBefore?.totalPerChain.find(t => t.name === "Kovan");
        expect(totalKovanScriptsBefore?.total).to.equal(2);
        const totalExecutionsKovanBefore = scriptStatsBefore?.totalExecutionsPerChain.find(t => t.name === "Kovan");
        expect(totalExecutionsKovanBefore?.total).to.equal(1);

        // Adding and executing scripts
        await transferScriptDocumentFactory({ user: '0xb79f76ef2c5f0286176833e7b2eee103b1cc3245', chainId: "42" });
        await transactionDocumentFactory({ chainId: "42" });
        await transactionDocumentFactory({ chainId: "42" });

        await supertest(app)
            .post("/api/admin/update-stats")
            .set('api_key', process.env.ADMIN_KEY!)
            .expect(200);

        // checking after update
        const userStatsAfter = await UserStats.findOne({ date: new Date().toISOString().slice(0, 10) });
        expect(userStatsAfter?.total).to.equal(3);
        const totalKovanUsersAfter = userStatsAfter?.totalPerChain.find(t => t.name === "Kovan");
        expect(totalKovanUsersAfter?.total).to.equal(2);

        const scriptStatsAfter = await ScriptStats.findOne({ date: new Date().toISOString().slice(0, 10) });
        expect(scriptStatsAfter?.total).to.equal(4);
        expect(scriptStatsAfter?.totalExecutions).to.equal(5);
        const totalKovanScriptsAfter = scriptStatsAfter?.totalPerChain.find(t => t.name === "Kovan");
        expect(totalKovanScriptsAfter?.total).to.equal(3);
        const totalExecutionsKovanAfter = scriptStatsAfter?.totalExecutionsPerChain.find(t => t.name === "Kovan");
        expect(totalExecutionsKovanAfter?.total).to.equal(3);
    });
});
