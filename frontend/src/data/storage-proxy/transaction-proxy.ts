import { ITransaction } from "@daemons-fi/shared-definitions";
import { storageAddress } from ".";

export interface IFetchedTxs {
    transactions: ITransaction[];
    totalCount: number;
    itemsPerPage: number;
}

export class TransactionProxy {
    /**
     * Fetch the transactions relative to this user's scripts
     * @param chainId the id of the considered chain
     * @param page the page to fetch
     */
    public static async fetchUserTransactions(
        chainId?: string,
        page?: number
    ): Promise<IFetchedTxs> {
        if (!chainId) {
            console.warn("Missing chain id. User transactions fetch aborted");
            return { totalCount: 0, itemsPerPage: 20, transactions: [] };
        }

        console.log(`Fetching user transactions for chain ${chainId}`);
        let url = `${storageAddress}/transactions/receiver/${chainId}`;
        if (page) url += `?page=${page}`;

        const requestOptions = { method: "GET", credentials: "include" };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return { totalCount: 0, itemsPerPage: 20, transactions: [] };

        const fetchedTxs: IFetchedTxs = await response.json();
        return fetchedTxs;
    }

    /**
     * Fetch the transactions that this user executed
     * @param chainId the id of the considered chain
     * @param page the page to fetch
     */
    public static async fetchExecutedTransactions(
        chainId?: string,
        page?: number
    ): Promise<IFetchedTxs> {
        if (!chainId) {
            console.warn("Missing chain id. Executed transactions fetch aborted");
            return { totalCount: 0, itemsPerPage: 20, transactions: [] };
        }

        console.log(`Fetching transactions executed on chain ${chainId}`);
        let url = `${storageAddress}/transactions/executor/${chainId}`;
        if (page) url += `?page=${page}`;

        const requestOptions = { method: "GET", credentials: "include" };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return { totalCount: 0, itemsPerPage: 20, transactions: [] };

        const fetchedTxs: IFetchedTxs = await response.json();
        return fetchedTxs;
    }
}
