import supertest from 'supertest';
import { app } from '../../app';
import { expect } from 'chai';
import { connectToTestDb, closeTestDb, clearTestDb } from '../../test/test-db-handler';
import jwt from 'jsonwebtoken';
import { transactionDocumentFactory, transactionFactory } from '../../test-factories/transactions-factories';
import { Transaction } from '../../models/transaction';
import { TransactionOutcome } from '../../../../shared-definitions/transactions/transaction';


describe('POST api/transactions/:hash/update', () => {
    before(async () => await connectToTestDb());
    afterEach(async () => await clearTestDb());
    after(async () => await closeTestDb());

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it('successfully updates a transaction', async () => {
        const transaction = await transactionDocumentFactory({ beneficiaryUser: userAddress, outcome: TransactionOutcome.Waiting });
        const payload = { outcome: TransactionOutcome.Confirmed };

        await supertest(app)
            .post(`/api/transactions/${transaction.hash}/update`)
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(200);

        const updatedTransaction = await Transaction.findOne({ hash: transaction.hash });
        expect(updatedTransaction).to.not.be.null;
        expect(updatedTransaction!.outcome).to.be.equal(payload.outcome);
    });

    it('fails if user is not authenticated', async () => {
        const transaction = await transactionDocumentFactory({ beneficiaryUser: userAddress, outcome: TransactionOutcome.Waiting });
        const payload = { outcome: TransactionOutcome.Confirmed };

        await supertest(app)
            .post(`/api/transactions/${transaction.hash}/update`)
            .send(payload)
            .expect(401);

        // verify nothing was changed
        const updatedTransaction = await Transaction.findOne({ hash: transaction.hash });
        expect(updatedTransaction).to.not.be.null;
        expect(updatedTransaction!.outcome).to.be.equal(transaction.outcome);
    });

    it('fails if user is trying to add a transaction for another user (as executor)', async () => {
        // beneficiaryUser will be a random address
        const transaction = await transactionDocumentFactory({ outcome: TransactionOutcome.Waiting });
        const payload = { outcome: TransactionOutcome.Confirmed };

        await supertest(app)
            .post(`/api/transactions/${transaction.hash}/update`)
            .send(payload)
            .expect(401);

        // verify nothing was changed
        const updatedTransaction = await Transaction.findOne({ hash: transaction.hash });
        expect(updatedTransaction).to.not.be.null;
        expect(updatedTransaction!.outcome).to.be.equal(transaction.outcome);
    });

    it('fails if the transaction state is not "waiting"', async () => {
        // Add a transaction with state !== Waiting
        const transaction = await transactionDocumentFactory({ beneficiaryUser: userAddress, outcome: TransactionOutcome.NotFound });
        const payload = { outcome: TransactionOutcome.Confirmed };

        await supertest(app)
            .post(`/api/transactions/${transaction.hash}/update`)
            .set('Cookie', `token=${jwToken}`)
            .send(payload)
            .expect(400);

        // verify nothing was changed
        const updatedTransaction = await Transaction.findOne({ hash: transaction.hash });
        expect(updatedTransaction).to.not.be.null;
        expect(updatedTransaction!.outcome).to.be.equal(transaction.outcome);
    });

});
