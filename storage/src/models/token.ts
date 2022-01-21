import { utils } from 'ethers';
import mongoose from 'mongoose';


const tokenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    address: { type: String, required: true, index: true, set: utils.getAddress },
    decimals: { type: Number, required: true },
    logoURL: { type: String, required: true },
    chainId: { type: String, required: true },
    hasPriceFeed: { type: Boolean, default: false }, // describes whether the token can be used
});

export interface IToken {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    logoURL: string;
    chainId: string;
    hasPriceFeed: boolean;
}

export interface ITokenDocument extends IToken, mongoose.Document { }

interface ITokenModelSchema extends mongoose.Model<ITokenDocument> {
    build(token: IToken): ITokenDocument;
}

tokenSchema.statics.build = (token: IToken) => new Token(token);
export const Token = mongoose.model<ITokenDocument, ITokenModelSchema>('Token', tokenSchema);
