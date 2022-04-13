import { storageAddress } from ".";
import fetch from "cross-fetch";

export interface IUserStat {
    date: string;
    amount: number;
}

export class StatsProxy {
    public static async getUserStats(chainId: string): Promise<IUserStat[]> {
        const url = `${storageAddress}/stats/users/${chainId}`;
        const requestOptions = { method: "GET", credentials: "include" };

        const response = await fetch(url, requestOptions as any);
        return await response.json();
    }
}
