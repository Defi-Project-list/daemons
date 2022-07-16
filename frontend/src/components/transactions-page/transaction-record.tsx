import React from "react";
import { ITransaction } from "@daemons-fi/shared-definitions";

interface ITransactionRecordProps {
    transaction: ITransaction;
    explorerTxUrl: string;
}

const getExplorerLink = (transaction: ITransaction, explorerTxUrl: string): JSX.Element => (
    <a className="transaction-record__explorer-link" href={`${explorerTxUrl}${transaction.hash}`}>
        See explorer.
    </a>
);

export function TransactionRecord({
    transaction,
    explorerTxUrl
}: ITransactionRecordProps): JSX.Element {
    const date = Intl.DateTimeFormat().format(new Date(transaction.date));
    const link = getExplorerLink(transaction, explorerTxUrl);
    const shortenedDescription =
        transaction.description.length <= 40
            ? transaction.description
            : transaction.description.slice(0, 40) + "...";

    return (
        <tr className="transaction-record">
            <td>
                <span className="transaction-record__description">{shortenedDescription}</span>
            </td>
            <td className="transaction-record__cell--center">
                <span className="transaction-record__type">{transaction.scriptType}</span>
            </td>
            <td className="transaction-record__cell--center">
                <span className="transaction-record__date">{date}</span>
            </td>
            <td className="transaction-record__cell--center">
                {link}
            </td>
        </tr>
    );
}
