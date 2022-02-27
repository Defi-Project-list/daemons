import { utils } from 'ethers';
import mongoose from 'mongoose';
import { TransactionOutcome, ITransaction } from '../../../messages/transactions/transaction';
import { stringifyBigNumber } from './utils';


const transactionSchema = new mongoose.Schema({
    hash: { type: String, required: true, index: { unique: true } },
    chainId: { type: String, required: true, set: stringifyBigNumber },
    executingUser: { type: String, required: true, set: utils.getAddress },
    beneficiaryUser: { type: String, required: true, index: true, set: utils.getAddress },
    date: { type: Date, required: true },
    outcome: { type: String, enum: TransactionOutcome, default: TransactionOutcome.Waiting }
});

interface ITransactionDocument extends ITransaction, mongoose.Document { }

interface ITransactionModelSchema extends mongoose.Model<ITransactionDocument> {
    build(transaction: ITransaction): ITransactionDocument;
}

transactionSchema.statics.build = (transaction: ITransaction) => new Transaction(transaction);
export const Transaction = mongoose.model<ITransactionDocument, ITransactionModelSchema>('Transaction', transactionSchema);
