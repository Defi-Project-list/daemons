import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import jwt from 'jsonwebtoken';
import { transactionDocumentFactory, transactionFactory } from '../../test-factories/transactions-factories';
import { Transaction } from '../../models/transaction';


describe('POST api/transactions', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it('successfully adds a transaction', async () => {
        const payload = transactionFactory({ executingUser: userAddress });

        await supertest(app)
            .post("/api/transactions")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const transaction = await Transaction.findOne({ hash: payload.hash });
        expect(transaction).to.not.be.null;
    });

    it('fails if user is not authenticated', async () => {
        const payload = transactionFactory({ executingUser: userAddress });

        await supertest(app)
            .post("/api/transactions")
            .send(payload)
            .expect(401);

        const transaction = await Transaction.findOne({ hash: payload.hash });
        expect(transaction).to.be.null;
    });

    it('fails if user is trying to add a transaction for another user (as executor)', async () => {
        const payload = transactionFactory({}); // executingUser will be a random address

        await supertest(app)
            .post("/api/transactions")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(403);

        const transaction = await Transaction.findOne({ hash: payload.hash });
        expect(transaction).to.be.null;
    });

    it('fails if the hash is not unique', async () => {
        // add a transaction to the db
        const txAlreadyInTheDb = await transactionDocumentFactory({});

        // try to send a tx with a duplicate hash
        const payload = transactionFactory({ hash: txAlreadyInTheDb.hash, executingUser: userAddress });

        await supertest(app)
            .post("/api/transactions")
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(400);

        const transactionsCount = await Transaction.count({ hash: payload.hash });
        expect(transactionsCount).to.be.equal(1);
    });

});
