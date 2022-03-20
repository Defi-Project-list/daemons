import { utils } from 'ethers';
import mongoose from 'mongoose';
import { ISignedMMBaseAction } from '../../../../shared-definitions/scripts/mm-base-action-messages';
import { balanceCondition, followCondition, frequencyCondition, priceCondition, repetitionsCondition } from './script-conditions';
import { removeIfEmpty, stringifyBigNumber, truncateAndEscapeText } from '../utils';


const mmBaseScriptSchema = new mongoose.Schema({
    // extra fields
    signature: { type: String, required: true },
    description: { type: String, required: true, maxlength: 150, set: truncateAndEscapeText },

    // message signed by the user
    scriptId: { type: String, required: true, index: { unique: true } },
    token: { type: String, required: true, set: utils.getAddress },
    aToken: { type: String, required: true, set: utils.getAddress },
    action: { type: Number, required: true },
    typeAmt: { type: Number, required: true },
    amount: { type: String, required: true, set: stringifyBigNumber },
    user: { type: String, required: true, index: true, set: utils.getAddress },
    kontract: { type: String, required: true, set: utils.getAddress },
    executor: { type: String, required: true, set: utils.getAddress },
    chainId: { type: String, required: true, set: stringifyBigNumber },
    balance: { type: balanceCondition, set: removeIfEmpty },
    frequency: { type: frequencyCondition, set: removeIfEmpty },
    price: { type: priceCondition, set: removeIfEmpty },
    repetitions: { type: repetitionsCondition, set: removeIfEmpty },
    follow: { type: followCondition, set: removeIfEmpty },
});

interface IMmBaseScriptDocument extends ISignedMMBaseAction, mongoose.Document { }

interface IMmBaseScriptModelSchema extends mongoose.Model<IMmBaseScriptDocument> {
    build(signedScript: ISignedMMBaseAction): IMmBaseScriptDocument;
}

mmBaseScriptSchema.statics.build = (signedScript: ISignedMMBaseAction) => new MmBaseScript(signedScript);
export const MmBaseScript = mongoose.model<IMmBaseScriptDocument, IMmBaseScriptModelSchema>('MmBaseScript', mmBaseScriptSchema);
