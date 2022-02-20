import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { transferScriptDocumentFactory } from '../../test-factories/script-factories';
import { expect } from 'chai';
import { TransferScript } from '../../models/transfer-script';
import jwt from 'jsonwebtoken';

describe('POST api/scripts/update-description', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it('successfully updates a script description if it exists', async () => {
        const script = await transferScriptDocumentFactory({ user: userAddress });
        const payload = { scriptId: script.scriptId, scriptType: "TransferScript", description: "abra cadabra magicabula" };

        await supertest(app)
            .post("/api/scripts/update-description")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const fetchedScript = await TransferScript.findOne({ scriptId: payload.scriptId });
        expect(fetchedScript.description).to.be.equal(payload.description);
    });

    it('handles the request gracefully if the script does not exist', async () => {
        const payload = { scriptId: "nonexistent", scriptType: "TransferScript", description: "abra cadabra magicabula" };

        await supertest(app)
            .post("/api/scripts/update-description")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);
    });

    it('returns a 400 error if the script type is not supported', async () => {
        const payload = { scriptId: "nonexistent", scriptType: "NonexistentScriptType", description: "abra cadabra magicabula" };

        await supertest(app)
            .post("/api/scripts/update-description")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(400)
            .expect(res => expect(res.text).to.equal('Unsupported script type NonexistentScriptType'));
    });
});
