import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { signedSwapActionFactory, signedTransferActionFactory } from '../../test/factories';
import { swapScriptDocumentFactory, transferScriptDocumentFactory } from '../../test/factories';
import { expect } from 'chai';
import { ISignedSwapAction } from '../../../../messages/definitions/swap-action-messages';
import { ISignedTransferAction } from '../../../../messages/definitions/transfer-action-messages';
import { utils } from 'ethers';
import { TransferScript } from '../../models/transfer-script';

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
        delete payload['destination'];

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(400);
    });

    it('fails if script ID is not unique', async () => {
        const payload = signedTransferActionFactory({});

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(200);

        await supertest(app)
            .post("/api/scripts/transfer")
            .send(payload)
            .expect(400);
    });
});
