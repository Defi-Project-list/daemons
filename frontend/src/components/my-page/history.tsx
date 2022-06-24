import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { ITransaction, TransactionOutcome } from "@daemons-fi/shared-definitions";
import { GetCurrentChain } from "../../data/chain-info";
import { StorageProxy } from "../../data/storage-proxy";
import { RootState } from "../../state";
import "./history.css";
import { updateSingleTransaction } from "../../state/action-creators/transactions-action-creators";
import { Card } from "../card-component/card";

export function History(): JSX.Element {
    const userTransactions = useSelector((state: RootState) => state.history.userTransactions);
    const loading = useSelector((state: RootState) => state.history.loading);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const [selected, setSelected] = useState<string>("");

    const explorerTxUrl = GetCurrentChain(chainId!).explorerTxUrl;

    const transactions = userTransactions.map((tx: ITransaction) => (
        <HistoryEntry
            key={tx.hash}
            transaction={tx}
            selected={tx.hash === selected}
            setSelected={setSelected}
            explorerTxUrl={explorerTxUrl}
        />
    ));

    return (
        <Card title="Transactions History" iconClass="card__title-icon--history">
             <div className="history__entries-container">
                {transactions}
            </div>
        </Card>
    );
}

interface IHistoryEntryProps {
    transaction: ITransaction;
    selected: boolean;
    setSelected: React.Dispatch<React.SetStateAction<string>>;
    explorerTxUrl: string;
}

function HistoryEntry({
    transaction,
    selected,
    setSelected,
    explorerTxUrl
}: IHistoryEntryProps): JSX.Element {
    const dispatch = useDispatch();
    const date = Intl.DateTimeFormat().format(new Date(transaction.date));
    const [isVerifying, setVerifying] = useState<boolean>(false);

    const verifyTransaction = async (transaction: ITransaction): Promise<void> => {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const receipt = (await provider.getTransactionReceipt(
            transaction.hash
        )) as TransactionReceipt | null;

        if (receipt) {
            // receipt is found, the tx can be confirmed and updated
            const tx = await StorageProxy.txs.confirmTransaction(transaction.hash, receipt);
            dispatch(updateSingleTransaction(tx));
        }

        const elapsed = new Date(transaction.date).getTime() - new Date().getTime();
        const twentyMinutes = 20 * 60 * 1000;
        if (elapsed > twentyMinutes) {
            // receipt is not found AND the tx is quite old already. Update the state to "Not-Found"
            const tx = { ...transaction, outcome: TransactionOutcome.NotFound };
            dispatch(updateSingleTransaction(tx));
        }

        // receipt not found but the tx is not that old. We'll try again in the future.
        return;
    };

    useState(async () => {
        if (transaction.outcome === TransactionOutcome.Waiting) {
            setVerifying(true);
            await verifyTransaction(transaction);
            setVerifying(false);
        }
    });

    return (
        <div className={"history-entry " + (selected ? "history-entry--selected" : "")}>
            <div className="history-entry__header" onClick={() => setSelected(transaction.hash)}>
                <span className="history-entry__outcome">
                    {isVerifying ? "checking.." : transaction.outcome}
                </span>
                <span className="history-entry__description">{transaction.description}</span>
                <span className="history-entry__date">{date}</span>
            </div>

            {selected && (
                <div className="history-entry__body">
                    <span className="history-entry__cost">Cost: 0.001 DAEM</span>
                    <a
                        className="history-entry__explorer"
                        href={explorerTxUrl + transaction.hash}
                        target="_blank"
                    >
                        Check out
                    </a>
                </div>
            )}
        </div>
    );
}
