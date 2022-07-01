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
    [TransactionOutcome.Confirmed]: "The transaction was successful",
    [TransactionOutcome.Waiting]:
        "The transaction has not been confirmed yet. Only Daemons or the script user can verify it",
    [TransactionOutcome.Failed]: "The transaction execution failed",
    [TransactionOutcome.NotFound]: "The transaction could not be found and will be removed"
};

export function TransactionRecord({ transaction }: ITransactionRecordProps): JSX.Element {
    const date = Intl.DateTimeFormat().format(new Date(transaction.date));
    const outcomeIcon = icons[transaction.outcome] ?? "";
    const message = messages[transaction.outcome] ?? `Unknown outcome ${transaction.outcome}`;
    const shortenedDescription = transaction.description.slice(0, 20) + "...";

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
                <div className={"transaction-record__outcome-icon " + outcomeIcon} />
            </td>
        </tr>
    );
}
