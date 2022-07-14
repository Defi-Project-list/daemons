import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { BigNumber, utils } from 'ethers';
import faker from '@faker-js/faker';
import { transactionDocumentFactory } from '../../test-factories/transactions-factories';
import { ITransaction } from '@daemons-fi/shared-definitions';


describe('GET api/transactions/receiver/:chainId/:userAddress', () => {

    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);


    it('only fetches transactions belonging to the specified user', async () => {
        // add to the db a couple of transactions from the known user address
        const tx1 = await transactionDocumentFactory({ beneficiaryUser: userAddress });
        const tx2 = await transactionDocumentFactory({ beneficiaryUser: userAddress });
        const hashes = [tx1.hash, tx2.hash];

        // and another couple from random addresses
        await transactionDocumentFactory({});
        await transactionDocumentFactory({});

        const chainId = "42";
        const response = await supertest(app)
            .get(`/api/transactions/receiver/${chainId}`)
            .set('Cookie', `token=${jwToken}`);

        const fetchedTransactions = response.body as ITransaction[];

        expect(fetchedTransactions.length).to.equal(2);
        expect(hashes).to.include(fetchedTransactions[0].hash);
        expect(hashes).to.include(fetchedTransactions[1].hash);
    });

    it('only fetches transactions targeting the specified chain', async () => {
        // add to the db a couple of transactions on chain 42
        const tx1 = await transactionDocumentFactory({ beneficiaryUser: userAddress, chainId: BigNumber.from("42") });
        const tx2 = await transactionDocumentFactory({ beneficiaryUser: userAddress, chainId: BigNumber.from("42") });
        const hashes = [tx1.hash, tx2.hash];

        // and another couple from random addresses
        await transactionDocumentFactory({ chainId: BigNumber.from("1") });
        await transactionDocumentFactory({ chainId: BigNumber.from("15") });

        const chainId = "42";
        const response = await supertest(app)
            .get(`/api/transactions/receiver/${chainId}`)
            .set('Cookie', `token=${jwToken}`);

        const fetchedTransactions = response.body as ITransaction[];

        expect(fetchedTransactions.length).to.equal(2);
        expect(hashes).to.include(fetchedTransactions[0].hash);
        expect(hashes).to.include(fetchedTransactions[1].hash);
    });

    it('returns a 401 error if trying to fetch transactions while not authenticated', async () => {
        const chainId = "42";
        await supertest(app)
            .get(`/api/transactions/receiver/${chainId}`)
            .expect(401);
    });
});
