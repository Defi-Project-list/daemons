import { storageAddress } from ".";
import fetch from "cross-fetch";

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
        if (response.status !== 200) throw new Error((await response.json()).error);

        return await response.json();
    }

    public static async getUserStats(chainId: string): Promise<IUserStat[]> {
        return await this.fetchStats(`/stats/users/${chainId}`);
    }

    public static async getScriptStats(chainId: string): Promise<IScriptStats[]> {
        return await this.fetchStats(`/stats/scripts/${chainId}`);
    }

    public static async getTransactionsStats(chainId: string): Promise<ITransactionsStats[]> {
        return await this.fetchStats(`/stats/transactions/${chainId}`);
    }
}
