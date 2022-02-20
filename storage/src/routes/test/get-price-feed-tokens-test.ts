import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import { ITokenDocument } from '../../models/token';
import { tokenDocumentFactory } from '../../test-factories/token-factories';


describe('GET /tokens/price-feed-tokens/:chainId', () => {

    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    it('fetches all tokens from the given chain that have hasPriceFeed set to TRUE', async () => {
        // add to the db some scripts on the desired chain with price feed
        const BTC = await tokenDocumentFactory({ chainId: "42", symbol: "BTC", hasPriceFeed: true });
        const DAI = await tokenDocumentFactory({ chainId: "42", symbol: "DAI", hasPriceFeed: true });
        const USDT = await tokenDocumentFactory({ chainId: "42", symbol: "USDT", hasPriceFeed: true });
        const addresses = [BTC.address.toLowerCase(), DAI.address.toLowerCase(), USDT.address.toLowerCase()];

        // and some on other chains
        await tokenDocumentFactory({ chainId: "1", hasPriceFeed: true }); // price feed, but wrong chain
        await tokenDocumentFactory({ chainId: "42", hasPriceFeed: false }); // right chain, but no price feed
        await tokenDocumentFactory({ chainId: "16665", hasPriceFeed: false }); // nor price feed, nor chain

        const chainId = "42";
        const response = await supertest(app).get(`/api/tokens/price-feed-tokens/${chainId}`);
        const fetchedTokens = response.body as ITokenDocument[];

        expect(fetchedTokens.length).to.equal(3);
        expect(addresses).to.include(fetchedTokens[0].address.toLowerCase());
        expect(addresses).to.include(fetchedTokens[1].address.toLowerCase());
        expect(addresses).to.include(fetchedTokens[2].address.toLowerCase());
    });
});
