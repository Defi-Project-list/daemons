import React from "react";
import { ITransaction, TransactionOutcome } from "@daemons-fi/shared-definitions";

interface ITransactionRecordProps {
    transaction: ITransaction;
    explorerTxUrl: string;
}

const icons = {
    [TransactionOutcome.Confirmed]: "icon--check",
    [TransactionOutcome.Waiting]: "icon--waiting",
    [TransactionOutcome.Failed]: "icon--failed",
    [TransactionOutcome.NotFound]: "icon--question-mark"
};

const messages = {
    [TransactionOutcome.Confirmed]: "The transaction was successful.",
    [TransactionOutcome.Waiting]:
        "The transaction has not been confirmed yet. Either Daemons or the script user will verify it.",
    [TransactionOutcome.Failed]: "The transaction execution failed.",
    [TransactionOutcome.NotFound]: "The transaction could not be found and will be removed."
};

const getExplorerLink = (transaction: ITransaction, explorerTxUrl: string): JSX.Element => (
    <a className="transaction-record__explorer-link" href={`${explorerTxUrl}/${transaction.hash}`}>
        See explorer.
    </a>
);

export function TransactionRecord({
    transaction,
    explorerTxUrl
}: ITransactionRecordProps): JSX.Element {
    const date = Intl.DateTimeFormat().format(new Date(transaction.date));
    const outcomeIcon = icons[transaction.outcome] ?? "";
    const message = messages[transaction.outcome] ?? `Unknown outcome ${transaction.outcome}`;
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
                <div className="tooltip">
                    <div className={"transaction-record__outcome-icon " + outcomeIcon} />
                    <div className="tooltip__content tooltip__content--left">
                        {message} {link}
                    </div>
                </div>
            </td>
        </tr>
    );
}
