import mongoose from 'mongoose';
import { ISignedTransferAction } from '../../../messages/definitions/transfer-action-messages';
import { utils } from 'ethers';
import { stringifyBigNumber, truncateAndEscapeText } from './utils';


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
    balance: {
        enabled: { type: Boolean, required: true },
        token: { type: String, required: true },
        comparison: { type: Number, required: true },
        amount: { type: String, required: true, set: stringifyBigNumber },
    },
    frequency: {
        enabled: { type: Boolean, required: true },
        delay: { type: String, required: true, set: stringifyBigNumber },
        start: { type: String, required: true, set: stringifyBigNumber },
    },
    price: {
        enabled: { type: Boolean, required: true },
        token: { type: String, required: true },
        comparison: { type: Number, required: true },
        value: { type: String, required: true, set: stringifyBigNumber },
    },
    repetitions: {
        enabled: { type: Boolean, required: true },
        amount: { type: String, required: true, set: stringifyBigNumber },
    },
    follow: {
        enabled: { type: Boolean, required: true },
        scriptId: { type: String, required: true, set: stringifyBigNumber },
        executor: { type: String, required: true, set: utils.getAddress },
        shift: { type: String, required: true, set: stringifyBigNumber },
    },
});

interface ITransferScriptDocument extends ISignedTransferAction, mongoose.Document { }

interface ITransferScriptModelSchema extends mongoose.Model<any> {
    build(signedScript: ISignedTransferAction): ITransferScriptDocument;
}

transferScriptSchema.statics.build = (signedScript: ISignedTransferAction) => new TransferScript(signedScript);
export const TransferScript = mongoose.model<ITransferScriptDocument, ITransferScriptModelSchema>('TransferScript', transferScriptSchema);
