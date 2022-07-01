import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ITransaction } from "@daemons-fi/shared-definitions";
import { GetCurrentChain } from "../../data/chain-info";
import { RootState } from "../../state";
import { TransactionRecord } from "./transaction-record";

interface ITransactionsPanelProps {
    fetchTransactions: (chainId?: string, user?: string, page?: number) => Promise<ITransaction[]>;
}

export function TransactionsPanel({ fetchTransactions }: ITransactionsPanelProps): JSX.Element {
    const userWallet = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const explorerTxUrl = GetCurrentChain(chainId!).explorerTxUrl;
    const [transactions, setTransactions] = useState<ITransaction[]>([]);

    useEffect(() => {
        fetchTransactions(chainId, userWallet).then((txs) => setTransactions(txs));
    }, []);

    return (
        <div className="transactions-panel">
            <table className="transactions-panel__table">
                <thead className="transactions-panel__table-head">
                    <tr>
                        <th className="transactions-panel__header--left">Description</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Outcome</th>
                    </tr>
                    <tr>
                        <td colSpan={4}>
                            <hr className="transactions-panel__separator"/>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx: ITransaction) => (
                        <TransactionRecord
                            key={tx.hash}
                            transaction={tx}
                            explorerTxUrl={explorerTxUrl}
                        />
                    ))}
                </tbody>
            </table>

            <div className="transactions-panel__pagination">{/* PAGINATION TO BE ADDED! */}</div>
        </div>
    );
}
