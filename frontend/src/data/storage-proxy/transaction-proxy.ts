import { ITransaction } from "@daemons-fi/shared-definitions";
import { storageAddress } from ".";

export class TransactionProxy {

    /**
     * Fetch the transactions relative to this user's scripts
     * @param chainId the id of the considered chain
     * @param page the page to fetch
     */
    public static async fetchUserTransactions(
        chainId?: string,
        page?: number
    ): Promise<ITransaction[]> {
        if (!chainId) {
            console.warn("Missing chain id. User transactions fetch aborted");
            return [];
        }

        console.log(`Fetching user transactions for chain ${chainId}`);
        const url = `${storageAddress}/transactions/receiver/${chainId}`;

        const requestOptions = { method: "GET", credentials: "include" };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return [];

        const transactions: ITransaction[] = await response.json();
        return transactions;
    }

    /**
     * Fetch the transactions that this user executed
     * @param chainId the id of the considered chain
     * @param page the page to fetch
     */
    public static async fetchExecutedTransactions(
        chainId?: string,
        page?: number
    ): Promise<ITransaction[]> {
        if (!chainId) {
            console.warn("Missing chain id. Executed transactions fetch aborted");
            return [];
        }

        console.log(`Fetching transactions executed on chain ${chainId}`);
        const url = `${storageAddress}/transactions/executor/${chainId}`;

        const requestOptions = { method: "GET", credentials: "include" };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return [];

        const transactions: ITransaction[] = await response.json();
        return transactions;
    }
}
