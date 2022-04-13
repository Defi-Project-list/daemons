import { storageAddress } from ".";
import fetch from "cross-fetch";

interface ICachedStats {
    timestamp: number;
    data: any[];
}

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
    private static storeData(key: string, data: any[]): void {
        const cachedData: ICachedStats = { timestamp: Date.now(), data };
        window.localStorage.setItem(key, JSON.stringify(cachedData));
    }

    private static fetchCachedData(key: string): any[]|undefined {
        const cache = window.localStorage.getItem(key);
        if (!cache) return;

        const maxTimestamp = 1000 * 60 * 60 * 6; // 6 hours
        const cachedData = JSON.parse(cache);
        if (Date.now() - cachedData.timestamp > maxTimestamp) return;

        return cachedData.data;
    }

    public static async getUserStats(chainId: string): Promise<IUserStat[]> {
        const endpoint = `/stats/users/${chainId}`;
        const cachedData = this.fetchCachedData(endpoint);
        if (cachedData) return cachedData;

        const url = `${storageAddress}${endpoint}`;
        const requestOptions = { method: "GET", credentials: "include" };

        const response = await fetch(url, requestOptions as any);
        const stats = await response.json();
        this.storeData(endpoint, stats)

        return stats;
    }

    public static async getScriptStats(chainId: string): Promise<IScriptStats[]> {
        const endpoint = `/stats/scripts/${chainId}`;
        const cachedData = this.fetchCachedData(endpoint);
        if (cachedData) return cachedData;

        const url = `${storageAddress}${endpoint}`;
        const requestOptions = { method: "GET", credentials: "include" };

        const response = await fetch(url, requestOptions as any);
        const stats = await response.json();
        this.storeData(endpoint, stats)

        return stats;
    }

    public static async getTransactionsStats(chainId: string): Promise<ITransactionsStats[]> {
        const endpoint = `/stats/transactions/${chainId}`;
        const cachedData = this.fetchCachedData(endpoint);
        if (cachedData) return cachedData;

        const url = `${storageAddress}${endpoint}`;
        const requestOptions = { method: "GET", credentials: "include" };

        const response = await fetch(url, requestOptions as any);
        const stats = await response.json();
        this.storeData(endpoint, stats)

        return stats;
    }
}
