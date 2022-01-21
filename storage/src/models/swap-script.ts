import { utils } from 'ethers';
import mongoose from 'mongoose';
import { ISignedSwapAction } from '../../../messages/definitions/swap-action-messages';
import { stringifyBigNumber } from './utils';


const swapScriptSchema = new mongoose.Schema({
    // user's signature
    signature: { type: String, required: true },

    // transfer action params
    scriptId: { type: String, required: true, index: { unique: true } },
    tokenFrom: { type: String, required: true },
    tokenTo: { type: String, required: true },
    amount: { type: String, required: true, set: stringifyBigNumber },
    user: { type: String, required: true, index: true, set: utils.getAddress },
    executor: { type: String, required: true },
    chainId: { type: String, required: true, set: stringifyBigNumber },
    balance: {
        enabled: { type: Boolean, required: true },
        token: { type: String, required: true },
        comparison: { type: Number, required: true },
        amount: { type: String, required: true, set: stringifyBigNumber },
    },
    frequency: {
        enabled: { type: Boolean, required: true },
        blocks: { type: String, required: true, set: stringifyBigNumber },
        startBlock: { type: String, required: true, set: stringifyBigNumber },
    },
    price: {
        enabled: { type: Boolean, required: true },
        token: { type: String, required: true },
        comparison: { type: Number, required: true },
        value: { type: String, required: true, set: stringifyBigNumber },
    },
});

interface ISwapScriptDocument extends ISignedSwapAction, mongoose.Document { }

interface ISwapScriptModelSchema extends mongoose.Model<ISwapScriptDocument> {
    build(signedScript: ISignedSwapAction): ISwapScriptDocument;
}

swapScriptSchema.statics.build = (signedScript: ISignedSwapAction) => new SwapScript(signedScript);
export const SwapScript = mongoose.model<ISwapScriptDocument, ISwapScriptModelSchema>('SwapScript', swapScriptSchema);