import faker from "@faker-js/faker";
import { IScriptStats, ScriptStats } from "../models/stats/script-stats";
import { ITransactionStats, TransactionStats } from "../models/stats/transaction-stats";
import { IUserStats, UserStats } from "../models/stats/user-stats";
import { randomChainId, randomScriptType } from "./utils";

/** Returns a randomized ScriptStats */
export function scriptStatsFactory(args: any): IScriptStats {
    return {
        date: args.date ?? new Date(),
        amount: args.amount ?? faker.datatype.number({ min: 0, max: 100 }),
        kind: args.kind ?? randomScriptType(),
        chainId: args.chainId ?? randomChainId()
    };
}
/** Adds a ScriptStats to mongo and returns it */
export async function scriptStatsDocumentFactory(args: any): Promise<IScriptStats> {
    return await ScriptStats.build(scriptStatsFactory(args)).save();
}

/** Returns a randomized TransactionStats */
export function transactionStatsFactory(args: any): ITransactionStats {
    return {
        date: args.date ?? new Date(),
        amount: args.amount ?? faker.datatype.number({ min: 0, max: 100 }),
        kind: args.kind ?? randomScriptType(),
        chainId: args.chainId ?? randomChainId()
    };
}
/** Adds a TransactionStats to mongo and returns it */
export async function transactionStatsDocumentFactory(args: any): Promise<IScriptStats> {
    return await TransactionStats.build(scriptStatsFactory(args)).save();
}

/** Returns a randomized UserStats */
export function userStatsFactory(args: any): IUserStats {
    return {
        date: args.date ?? new Date(),
        amount: args.amount ?? faker.datatype.number({ min: 0, max: 100 }),
        chainId: args.chainId ?? randomChainId()
    };
}
/** Adds a UserStats to mongo and returns it */
export async function userStatsDocumentFactory(args: any): Promise<IUserStats> {
    return await UserStats.build(scriptStatsFactory(args)).save();
}
