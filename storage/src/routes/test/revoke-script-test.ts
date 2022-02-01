import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { transferScriptDocumentFactory } from '../../test-factories/script-factories';
import { expect } from 'chai';
import { TransferScript } from '../../models/transfer-script';

describe('POST api/scripts/revoke', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it('successfully removes a script from the db if it exists', async () => {
        const script = await transferScriptDocumentFactory({});
        const payload = { scriptId: script.scriptId, scriptType: "TransferScript" };

        await supertest(app)
            .post("/api/scripts/revoke")
            .send(payload)
            .expect(200);

        const fetchedScript = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(fetchedScript).to.be.null;
    });

    it('handles the request gracefully if the script does not exist', async () => {
        const payload = { scriptId: "nonexistent", scriptType: "TransferScript" };

        await supertest(app)
            .post("/api/scripts/revoke")
            .send(payload)
            .expect(200);
    });

    it('returns a 400 error if the script type is not supported', async () => {
        const payload = { scriptId: "nonexistent", scriptType: "NonexistentScriptType" };

        await supertest(app)
            .post("/api/scripts/revoke")
            .send(payload)
            .expect(400)
            .expect(res => expect(res.text).to.equal('Unsupported script type NonexistentScriptType'));
    });
});
