import { BaseScript } from '@daemons-fi/scripts-definitions';
import { ITransaction, TransactionOutcome } from '@daemons-fi/shared-definitions';
import { TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider';
import { utils } from 'ethers';
import { storageAddress } from '.';

interface IMinimalTransaction {
    hash: string;
    date: string;
}


export class TransactionProxy {

    /**
     * Informs the storage that a transaction has been executed.
     * Some values are unknown yet, but will be verified by the tx beneficiary.
     * */
    public static async addTransaction(
        txResponse: TransactionResponse,
        script: BaseScript,
        executingUser: string
    ): Promise<void> {
        console.log(`Adding transaction ${txResponse.hash}`);
        const transaction: ITransaction = {
            hash: txResponse.hash,
            scriptId: script.getId(),
            scriptType: script.ScriptType,
            description: script.getDescription(),
            chainId: script.getMessage().chainId,
            executingUser: utils.getAddress(executingUser),
            beneficiaryUser: utils.getAddress(script.getUser()),
            date: new Date(),
            outcome: TransactionOutcome.Waiting,
        };

        const url = `${storageAddress}/transactions`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(transaction),
        };

        await fetch(url, requestOptions as any);
    }

    /**
     * Fills up the missing info from the transaction.
     * Can only be executed by the tx beneficiary.
     * */
    public static async confirmTransaction(
        txHash: string,
        outcome: TransactionOutcome,
    ): Promise<ITransaction> {

        const url = `${storageAddress}/transactions/${txHash}/update`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({outcome}),
        };

        const response = await fetch(url, requestOptions as any);
        return await response.json();
    }

    public static async fetchUserTransactions(chainId?: string, page?: number): Promise<ITransaction[]> {
        if (!chainId) {
            console.warn("Missing chain id. User transactions fetch aborted");
            return [];
        }

        console.log(`Fetching user transactions for chain ${chainId}`);
        const url = `${storageAddress}/transactions/receiver/${chainId}`;

        const requestOptions = { method: 'GET', credentials: 'include' };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return [];

        const transactions: ITransaction[] = await response.json();
        return transactions;
    }

    public static async fetchExecutedTransactions(chainId?: string, page?: number): Promise<ITransaction[]> {
        if (!chainId) {
            console.warn("Missing chain id. Executed transactions fetch aborted");
            return [];
        }

        console.log(`Fetching transactions executed on chain ${chainId}`);
        const url = `${storageAddress}/transactions/executor/${chainId}`;

        const requestOptions = { method: 'GET', credentials: 'include' };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return [];

        const transactions: ITransaction[] = await response.json();
        return transactions;
    }

    public static async fetchUnverifiedTransactions(chainId: string): Promise<IMinimalTransaction[]> {
        console.log(`Fetching unverified transactions for chain ${chainId}`);
        const url = `${storageAddress}/transactions/unverified/${chainId}`;

        const requestOptions = { method: 'GET', credentials: 'include' };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return [];

        const transactions: IMinimalTransaction[] = await response.json();
        return transactions;
    }
}
