import { BaseScript } from "@daemons-fi/scripts-definitions";
import { ITransaction, TransactionOutcome } from "@daemons-fi/shared-definitions";
import { utils } from "ethers";
import { storageAddress } from ".";

interface IMinimalTransaction {
    hash: string;
    date: string;
}

export class TransactionProxy {

    /**
     * Informs the storage that a transaction has been executed.
     * Some values are unknown yet, but will be verified by the tx beneficiary.
     * @param txHash the blockchain hash of the transaction
     * @param script the script relative to the transaction
     * @param executingUser the user that executed the script
     */
    public static async addTransaction(
        txHash: string,
        script: BaseScript,
        executingUser: string
    ): Promise<void> {
        const transaction: ITransaction = {
            hash: txHash,
            scriptId: script.getId(),
            scriptType: script.ScriptType,
            description: script.getDescription(),
            chainId: script.getMessage().chainId,
            executingUser: utils.getAddress(executingUser),
            beneficiaryUser: utils.getAddress(script.getUser()),
            date: new Date(),
            outcome: TransactionOutcome.Waiting
        };

        if (transaction.beneficiaryUser === transaction.executingUser) {
            // executing your own scripts does not generate new transactions.
            return;
        }

        console.log(`Adding transaction ${txHash}`);
        const url = `${storageAddress}/transactions`;
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(transaction)
        };

        await fetch(url, requestOptions as any);
    }

    /**
     * Fills up the missing info from the transaction.
     * Can only be executed by the tx beneficiary.
     * @param txHash the blockchain hash of the transaction
     * @param outcome the transaction outcome
     */
    public static async confirmTransaction(
        txHash: string,
        outcome: TransactionOutcome
    ): Promise<ITransaction> {
        const url = `${storageAddress}/transactions/${txHash}/update`;
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ outcome })
        };

        const response = await fetch(url, requestOptions as any);
        return await response.json();
    }

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

    /**
     * Fetch the transactions of this user that have not been verified yet
     * @param chainId the id of the considered chain
     */
    public static async fetchUnverifiedTransactions(
        chainId: string
    ): Promise<IMinimalTransaction[]> {
        console.log(`Fetching unverified transactions for chain ${chainId}`);
        const url = `${storageAddress}/transactions/unverified/${chainId}`;

        const requestOptions = { method: "GET", credentials: "include" };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return [];

        const transactions: IMinimalTransaction[] = await response.json();
        return transactions;
    }
}
