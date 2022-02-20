import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import { ITokenDocument } from '../../models/token';
import { tokenDocumentFactory } from '../../test-factories/token-factories';
import jwt from 'jsonwebtoken';


describe('GET /tokens/:chainId', () => {

    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it('returns an empty array if there are no tokens on the db', async () => {
        const chainId = "42";
        const response = await supertest(app)
            .get(`/api/tokens/${chainId}`)
            .set('Cookie', `token=${jwToken}`)
            .expect(200);

        const fetchedTokens = response.body as ITokenDocument[];
        console.log(fetchedTokens);

        expect(fetchedTokens.length).to.equal(0);
    });

    it('fetches all tokens from the given chain', async () => {
        // add to the db some scripts on the desired chain
        const BTC = await tokenDocumentFactory({ chainId: "42", symbol: "BTC" });
        const DAI = await tokenDocumentFactory({ chainId: "42", symbol: "DAI" });
        const USDT = await tokenDocumentFactory({ chainId: "42", symbol: "USDT" });
        const addresses = [BTC.address.toLowerCase(), DAI.address.toLowerCase(), USDT.address.toLowerCase()];

        // and some on other chains
        await tokenDocumentFactory({ chainId: "1" });
        await tokenDocumentFactory({ chainId: "2" });
        await tokenDocumentFactory({ chainId: "16665" });

        const chainId = "42";
        const response = await supertest(app)
            .get(`/api/tokens/${chainId}`)
            .set('Cookie', `token=${jwToken}`)
            .expect(200);

        const fetchedTokens = response.body as ITokenDocument[];
        console.log(fetchedTokens);

        expect(fetchedTokens.length).to.equal(3);
        expect(addresses).to.include(fetchedTokens[0].address.toLowerCase());
        expect(addresses).to.include(fetchedTokens[1].address.toLowerCase());
        expect(addresses).to.include(fetchedTokens[2].address.toLowerCase());
    });

    it('returns a 401 error if trying to fetch tokens while not authenticated', async () => {
        const chainId = "42";
        await supertest(app)
            .get(`/api/tokens/${chainId}`)
            .expect(401);
    });
});
