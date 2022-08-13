import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ITransaction } from "@daemons-fi/shared-definitions";
import { GetCurrentChain } from "../../data/chain-info";
import { RootState } from "../../state";
import { TransactionRecord } from "./transaction-record";
import { IFetchedTxs } from "../../data/storage-proxy/transaction-proxy";
import PaginationFooter from "../../components/pagination";

interface ITransactionsPanelProps {
    isBeneficiary: boolean;
    fetchTransactions: (chainId?: string, page?: number) => Promise<IFetchedTxs>;
}

export function TransactionsPanel({
    isBeneficiary,
    fetchTransactions
}: ITransactionsPanelProps): JSX.Element {
    const chainId = useSelector((state: RootState) => state.user.chainId);
    const explorerTxUrl = GetCurrentChain(chainId!).explorerTxUrl;
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(20);

    useEffect(() => {
        fetchTransactions(chainId, page).then((txs) => {
            setTransactions(txs.transactions);
            setTotalCount(txs.totalCount);
            setItemsPerPage(txs.itemsPerPage);
        });
    }, [page]);

    return (
        <div className="transactions-panel">
            <table className="transactions-panel__table">
                <thead className="transactions-panel__table-head">
                    <tr>
                        <th className="transactions-panel__header--left">Description</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Link</th>
                        <th>{isBeneficiary ? "Cost" : "Profit"}</th>
                    </tr>
                    <tr>
                        <td colSpan={5}>
                            <hr className="transactions-panel__separator" />
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx: ITransaction) => (
                        <TransactionRecord
                            key={tx.hash}
                            isBeneficiary={isBeneficiary}
                            transaction={tx}
                            explorerTxUrl={explorerTxUrl}
                        />
                    ))}
                </tbody>
            </table>

            <div className="transactions-panel__pagination-container">
                <PaginationFooter
                    page={page}
                    totalCount={totalCount}
                    itemsPerPage={itemsPerPage}
                    setPage={setPage}
                />
            </div>
        </div>
    );
}
