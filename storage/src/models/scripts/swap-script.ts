import { utils } from 'ethers';
import mongoose from 'mongoose';
import { ISignedSwapAction } from '../../../../shared-definitions/scripts/swap-action-messages';
import { balanceCondition, followCondition, frequencyCondition, priceCondition, repetitionsCondition } from './script-conditions';
import { removeIfEmpty, stringifyBigNumber, truncateAndEscapeText } from '../utils';


const swapScriptSchema = new mongoose.Schema({
    // extra fields
    signature: { type: String, required: true },
    description: { type: String, required: true, maxlength: 150, set: truncateAndEscapeText },

    // message signed by the user
    scriptId: { type: String, required: true, index: { unique: true } },
    tokenFrom: { type: String, required: true },
    tokenTo: { type: String, required: true },
    typeAmt: { type: Number, required: true },
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

interface ISwapScriptDocument extends ISignedSwapAction, mongoose.Document { }

interface ISwapScriptModelSchema extends mongoose.Model<ISwapScriptDocument> {
    build(signedScript: ISignedSwapAction): ISwapScriptDocument;
}

swapScriptSchema.statics.build = (signedScript: ISignedSwapAction) => new SwapScript(signedScript);
export const SwapScript = mongoose.model<ISwapScriptDocument, ISwapScriptModelSchema>('SwapScript', swapScriptSchema);
