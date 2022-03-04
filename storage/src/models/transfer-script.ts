import mongoose from 'mongoose';
import { ISignedTransferAction } from '../../../shared-definitions/scripts/transfer-action-messages';
import { utils } from 'ethers';
import { balanceCondition, followCondition, frequencyCondition, priceCondition, repetitionsCondition } from './script-conditions';
import { removeIfEmpty, stringifyBigNumber, truncateAndEscapeText } from './utils';


const transferScriptSchema = new mongoose.Schema({
    // extra fields
    signature: { type: String, required: true },
    description: { type: String, required: true, maxlength: 150, set: truncateAndEscapeText },

    // message signed by the user
    scriptId: { type: String, required: true, unique: true, index: { unique: true } },
    token: { type: String, required: true },
    destination: { type: String, required: true },
    amount: { type: String, required: true, set: stringifyBigNumber },
    user: { type: String, required: true, index: true, set: utils.getAddress },
    executor: { type: String, required: true, set: utils.getAddress },
    chainId: { type: String, required: true, set: stringifyBigNumber },
    balance: { type: balanceCondition, set: removeIfEmpty },
    frequency: { type: frequencyCondition, set: removeIfEmpty },
    price: { type: priceCondition, set: removeIfEmpty },
    repetitions: { type: repetitionsCondition, set: removeIfEmpty },
    follow: { type: followCondition, set: removeIfEmpty },
});

interface ITransferScriptDocument extends ISignedTransferAction, mongoose.Document { }

interface ITransferScriptModelSchema extends mongoose.Model<any> {
    build(signedScript: ISignedTransferAction): ITransferScriptDocument;
}

transferScriptSchema.statics.build = (signedScript: ISignedTransferAction) => new TransferScript(signedScript);
export const TransferScript = mongoose.model<ITransferScriptDocument, ITransferScriptModelSchema>('TransferScript', transferScriptSchema);
