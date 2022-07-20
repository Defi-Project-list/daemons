import React from "react";
import { ITransaction } from "@daemons-fi/shared-definitions";
import { GetCurrentChain } from "../../data/chain-info";

interface ITransactionRecordProps {
    isBeneficiary: boolean;
    transaction: ITransaction;
    explorerTxUrl: string;
}

const getExplorerLink = (transaction: ITransaction, explorerTxUrl: string): JSX.Element => (
    <a className="transaction-record__explorer-link" href={`${explorerTxUrl}${transaction.hash}`}>
        link
    </a>
);

const getCostOrProfit = (transaction: ITransaction, isBeneficiary: boolean): JSX.Element =>
    isBeneficiary ? (
        <div className="transaction-record__amount transaction-record__amount--costs">
            <div>-</div>
            <div>{transaction.costEth} </div>
            <img
                className="transaction-record__token-icon"
                src={GetCurrentChain(transaction.chainId).coinIconPath}
            />
            {transaction.costDAEM > 0 ? (
                <>
                    <div>{transaction.costDAEM}</div>
                    {/* This will be replaced by the DAEM icon once we have it */}
                    <div>DAEM</div>
                </>
            ) : null}
        </div>
    ) : (
        <div className="transaction-record__amount transaction-record__amount--profits">
            <div>+</div>
            <div>{transaction.profitDAEM}</div>
            {/* This will be replaced by the DAEM icon once we have it */}
            <div>DAEM</div>
        </div>
    );

export function TransactionRecord({
    isBeneficiary,
    transaction,
    explorerTxUrl
}: ITransactionRecordProps): JSX.Element {
    const date = Intl.DateTimeFormat().format(new Date(transaction.date));
    const textToDisplay = isBeneficiary ? transaction.description : transaction.scriptId;
    const shortenedDescription =
        textToDisplay.length <= 30 ? textToDisplay : textToDisplay.slice(0, 30) + "...";

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
                {getExplorerLink(transaction, explorerTxUrl)}
            </td>
            <td className="transaction-record__cell--center">
                {getCostOrProfit(transaction, isBeneficiary)}
            </td>
        </tr>
    );
}
