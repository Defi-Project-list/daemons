import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { swapScriptDocumentFactory, transferScriptDocumentFactory } from '../../test/factories';
import { expect } from 'chai';
import { ISignedSwapAction } from '../../../../messages/definitions/swap-action-messages';
import { utils } from 'ethers';


describe('GET api/scripts/:userAddress', () => {

    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';

    it('returns an empty array if there are no scripts on the db', async () => {
        // add to the db a couple of scripts from randomly generated users
        await swapScriptDocumentFactory({});
        await transferScriptDocumentFactory({});

        const response = await supertest(app).get(`/api/scripts/${userAddress}`);
        const fetchedScripts = response.body as ISignedSwapAction[];

        expect(fetchedScripts.length).to.equal(0);
    });

    it('fetches all scripts belonging to the specified user', async () => {
        // add to the db a couple of scripts from the known user address
        const swapScript1 = await swapScriptDocumentFactory({ user: userAddress });
        const transferScript1 = await transferScriptDocumentFactory({ user: userAddress });
        const ids = [swapScript1.scriptId, transferScript1.scriptId];

        // and another couple from random addresses
        await swapScriptDocumentFactory({});
        await transferScriptDocumentFactory({});

        const response = await supertest(app).get(`/api/scripts/${userAddress}`);
        const fetchedScripts = response.body as ISignedSwapAction[];

        expect(fetchedScripts.length).to.equal(2);
        expect(ids).to.include(fetchedScripts[0].scriptId);
        expect(ids).to.include(fetchedScripts[1].scriptId);
    });

    it('is insensitive to the casing of the passed user address', async () => {
        // add to the db a couple of scripts from the known user address
        await swapScriptDocumentFactory({ user: userAddress });
        await transferScriptDocumentFactory({ user: userAddress });

        // call the API with a lowercase address
        const lowercaseAddress = userAddress.toLowerCase();
        const lowercaseAddressResponse = await supertest(app).get(`/api/scripts/${lowercaseAddress}`);
        const lowercaseAddressFetchedScripts = lowercaseAddressResponse.body as ISignedSwapAction[];

        // call the API with an address with checksum
        const checksumAddress = utils.getAddress(userAddress);
        const checksumAddressResponse = await supertest(app).get(`/api/scripts/${checksumAddress}`);
        const checksumAddressFetchedScripts = checksumAddressResponse.body as ISignedSwapAction[];

        expect(JSON.stringify(lowercaseAddressFetchedScripts)).to.equal(JSON.stringify(checksumAddressFetchedScripts));
    });
});
