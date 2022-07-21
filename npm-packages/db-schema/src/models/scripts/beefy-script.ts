import mongoose from 'mongoose';
import { ISignedBeefyAction } from '@daemons-fi/shared-definitions';
import { utils } from 'ethers';
import { balanceCondition, followCondition, frequencyCondition, priceCondition, repetitionsCondition } from './script-conditions';
import { removeIfEmpty, stringifyBigNumber } from '../utils';
import { Script } from "./script";


const beefyScriptSchema = new mongoose.Schema({
    // fields handled by parent 'Script'
    // scriptId
    // user
    // chainId
    // description

    // extra fields
    signature: { type: String, required: true },

    // message signed by the user
    //scriptId: { type: String, required: true, unique:true, index: { unique: true } },
    lpAddress: { type: String, required: true, set: utils.getAddress },
    mooAddress: { type: String, required: true, set: utils.getAddress },
    action: { type: Number, required: true },
    typeAmt: { type: Number, required: true },
    amount: { type: String, required: true, set: stringifyBigNumber },
    tip: { type: String, required: true, set: stringifyBigNumber },
    executor: { type: String, required: true, set: utils.getAddress },
    balance: { type: balanceCondition, set: removeIfEmpty },
    frequency: { type: frequencyCondition, set: removeIfEmpty },
    price: { type: priceCondition, set: removeIfEmpty },
    repetitions: { type: repetitionsCondition, set: removeIfEmpty },
    follow: { type: followCondition, set: removeIfEmpty },
});

interface IBeefyScriptDocument extends ISignedBeefyAction, mongoose.Document { }

interface IBeefyScriptModelSchema extends mongoose.Model<any> {
    build(signedScript: ISignedBeefyAction): IBeefyScriptDocument;
}

beefyScriptSchema.statics.build = (signedScript: ISignedBeefyAction) => new BeefyScript(signedScript);
export const BeefyScript = Script.discriminator<IBeefyScriptDocument, IBeefyScriptModelSchema>('BeefyScript', beefyScriptSchema);
