import mongoose from 'mongoose';
import { ITotalPerChain, totalPerChain } from './total-per-chain';

const scriptStatsSchema = new mongoose.Schema({
    total: { type: Number, required: true },
    totalExecutions: { type: Number, required: true },
    totalPerChain: { type: [totalPerChain], required: true },
    totalExecutionsPerChain: { type: [totalPerChain], required: true },
    date: { type: String, required: true },
});

export interface IScriptStats {
    total: number;
    totalExecutions: number;
    totalPerChain: ITotalPerChain[];
    totalExecutionsPerChain: ITotalPerChain[];
    date: string;
}

export interface IScriptStatsDocument extends IScriptStats, mongoose.Document { }

interface IScriptStatsModelSchema extends mongoose.Model<IScriptStatsDocument> {
    build(scriptStats: IScriptStats): IScriptStatsDocument;
}

scriptStatsSchema.statics.build = (scriptStats: IScriptStats) => new ScriptStats(scriptStats);
export const ScriptStats = mongoose.model<IScriptStatsDocument, IScriptStatsModelSchema>('ScriptStats', scriptStatsSchema);
