import React, { useEffect } from "react";
import { TransactionOutcome } from "@daemons-fi/shared-definitions/build";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { infoToast } from "./components/toaster";
import { StorageProxy } from "./data/storage-proxy";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "./state";

/// Component used to verify batch of transactions belonging to the user
export const TransactionsVerifier = (): JSX.Element => {
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);
    const toastId = React.useRef(null);

    useEffect(() => {
        if (authenticated && supportedChain) {
            verifyTransactionsForChain();
        }
    }, [chainId, authenticated]);

    const verifyTransactionsForChain = async (): Promise<void> => {
        const unverifiedTxs = await StorageProxy.txs.fetchUnverifiedTransactions(chainId!);
        if (unverifiedTxs.length === 0) return;

        toastId.current = infoToast("Verifying transactions") as any;

        let counter = 0;
        for (const tx of unverifiedTxs) {
            await verifyTransaction(tx.hash, tx.date);
            counter++;

            if (counter < unverifiedTxs.length)
                toast.update(toastId.current as any, {
                    render: `Tx ${counter}/${unverifiedTxs.length} verified`
                });
            else
                toast.update(toastId.current as any, {
                    type: toast.TYPE.SUCCESS,
                    render: `All transactions have been verified!`
                });
        }
    };

    const verifyTransaction = async (txHash: string, txDate: string): Promise<void> => {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const receipt: TransactionReceipt | null = await provider.getTransactionReceipt(txHash);

        const elapsed = new Date(txDate).getTime() - new Date().getTime();
        const twentyMinutes = 20 * 60 * 1000;

        if (!receipt && elapsed < twentyMinutes) {
            // the tx is quite recent and might not have been executed yet.
            // we just wait.
            return;
        }

        const txOutcome = extractOutcomeFromStatus(receipt?.status);

        //alert(`confirming tx: ${txOutcome}`);
        await StorageProxy.txs.confirmTransaction(txHash, txOutcome);
    };

    const extractOutcomeFromStatus = (status?: number): TransactionOutcome => {
        switch (status) {
            case undefined:
                return TransactionOutcome.NotFound;
            case 0:
                return TransactionOutcome.Failed;
            case 1:
                return TransactionOutcome.Confirmed;
            default:
                return TransactionOutcome.NotFound;
        }
    };

    return <></>;
};
