import { storageAddress } from ".";
import fetch from "cross-fetch";
import { Cacher } from "../cacher";

export interface IUserStat {
    date: string;
    amount: number;
}

export interface IScriptStats {
    date: string;
    amount: number;
    kind: string;
}

export interface ITransactionsStats {
    date: string;
    amount: number;
    kind: string;
}

export class StatsProxy {
    private static async fetchStats(endpoint: string): Promise<any[]> {
        const url = `${storageAddress}${endpoint}`;
        const requestOptions = { method: "GET", credentials: "include" };

        const response = await fetch(url, requestOptions as any);
        return await response.json();
    }

    public static async getUserStats(chainId: string): Promise<IUserStat[]> {
        const endpoint = `/stats/users/${chainId}`;
        return await Cacher.fetchData(endpoint, () => this.fetchStats(endpoint));
    }

    public static async getScriptStats(chainId: string): Promise<IScriptStats[]> {
        const endpoint = `/stats/scripts/${chainId}`;
        return await Cacher.fetchData(endpoint, () => this.fetchStats(endpoint));
    }

    public static async getTransactionsStats(chainId: string): Promise<ITransactionsStats[]> {
        const endpoint = `/stats/transactions/${chainId}`;
        return await Cacher.fetchData(endpoint, () => this.fetchStats(endpoint));
    }
}
