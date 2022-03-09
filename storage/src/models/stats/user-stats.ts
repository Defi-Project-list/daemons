import mongoose from 'mongoose';
import { ITotalPerChain, totalPerChain } from './total-per-chain';

const userStatsSchema = new mongoose.Schema({
    total: { type: Number, required: true },
    totalPerChain: { type: [totalPerChain], required: true },
    date: { type: String, required: true },
});

export interface IUserStats {
    total: number;
    totalPerChain: ITotalPerChain[];
    date: string;
}

export interface IUserStatsDocument extends IUserStats, mongoose.Document { }

interface IUserStatsModelSchema extends mongoose.Model<IUserStatsDocument> {
    build(userStats: IUserStats): IUserStatsDocument;
}

userStatsSchema.statics.build = (userStats: IUserStats) => new UserStats(userStats);
export const UserStats = mongoose.model<IUserStatsDocument, IUserStatsModelSchema>('UserStats', userStatsSchema);
