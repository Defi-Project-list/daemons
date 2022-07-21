import { utils } from "ethers";
import mongoose from "mongoose";
import { ITransaction } from "@daemons-fi/shared-definitions";
import { cleanScriptType, truncateAndEscapeText } from "./utils";

const transactionSchema = new mongoose.Schema({
    hash: { type: String, required: true, index: { unique: true } },
    chainId: { type: String, required: true },
    scriptId: { type: String, required: true },
    scriptType: { type: String, required: true, set: cleanScriptType },
    description: { type: String, required: true, maxlength: 150, set: truncateAndEscapeText },
    executingUser: { type: String, required: true, set: utils.getAddress },
    beneficiaryUser: { type: String, required: true, index: true, set: utils.getAddress },
    date: { type: Date, required: true },
    costEth: { type: Number, required: true },
    costDAEM: { type: Number, required: true },
    profitDAEM: { type: Number, required: true }
});

interface ITransactionDocument extends ITransaction, mongoose.Document {}

interface ITransactionModelSchema extends mongoose.Model<ITransactionDocument> {
    build(transaction: ITransaction): ITransactionDocument;
}

transactionSchema.statics.build = (transaction: ITransaction) => new Transaction(transaction);

export const Transaction = mongoose.model<ITransactionDocument, ITransactionModelSchema>(
    "Transaction",
    transactionSchema
);
