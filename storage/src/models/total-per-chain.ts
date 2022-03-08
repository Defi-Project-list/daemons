import mongoose from 'mongoose';

export const totalPerChain = new mongoose.Schema({
    name: { type: String, required: true },
    total: { type: Number, required: true },
});

export interface ITotalPerChain{
    name: string;
    total: number;
}
