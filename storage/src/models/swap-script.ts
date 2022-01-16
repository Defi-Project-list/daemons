import { BigNumber } from 'ethers';
import mongoose from 'mongoose';
import { ISignedSwapAction } from '../../../messages/definitions/swap-action-messages';


const swapScriptSchema = new mongoose.Schema({
    // user's signature
    signature: { type: String, required: true },

    // transfer action params
    scriptId: { type: String, required: true, index: { unique: true } },
    tokenFrom: { type: String, required: true },
    tokenTo: { type: String, required: true },
    amount: { type: String, required: true, set: (bigNumber: any) => BigNumber.from(bigNumber.hex).toString() },
    user: { type: String, required: true },
    executor: { type: String, required: true },
    chainId: { type: String, required: true, set: (bigNumber: any) => BigNumber.from(bigNumber.hex).toString() },
    balance: {
        enabled: { type: Boolean, required: true },
        token: { type: String, required: true },
        comparison: { type: Number, required: true },
        amount: { type: String, required: true, set: (bigNumber: any) => BigNumber.from(bigNumber.hex).toString() },
    },
    frequency: {
        enabled: { type: Boolean, required: true },
        blocks: { type: String, required: true, set: (bigNumber: any) => BigNumber.from(bigNumber.hex).toString() },
        startBlock: { type: String, required: true, set: (bigNumber: any) => BigNumber.from(bigNumber.hex).toString() },
    },
    price: {
        enabled: { type: Boolean, required: true },
        token: { type: String, required: true },
        comparison: { type: Number, required: true },
        value: { type: String, required: true, set: (bigNumber: any) => BigNumber.from(bigNumber.hex).toString() },
    },
});

interface ISwapScriptDocument extends ISignedSwapAction, mongoose.Document { }

interface ISwapScriptModelSchema extends mongoose.Model<ISwapScriptDocument> {
    build(signedScript: ISignedSwapAction): ISwapScriptDocument;
}

swapScriptSchema.statics.build = (signedScript: ISignedSwapAction) => new SwapScript(signedScript);
export const SwapScript = mongoose.model<ISwapScriptDocument, ISwapScriptModelSchema>('SwapScript', swapScriptSchema);
