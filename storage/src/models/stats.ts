import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
    totalUsers: { type: Number, required: true },
    totalScripts: { type: Number, required: true },
    date: { type: String, required: true },
});

export interface IStats {
    totalUsers: number;
    totalScripts: number;
    date: String;
}

export interface IStatsDocument extends IStats, mongoose.Document { }

interface IStatsModelSchema extends mongoose.Model<IStatsDocument> {
    build(stats: IStats): IStatsDocument;
}

statsSchema.statics.build = (stats: IStats) => new Stats(stats);
export const Stats = mongoose.model<IStatsDocument, IStatsModelSchema>('Stats', statsSchema);
