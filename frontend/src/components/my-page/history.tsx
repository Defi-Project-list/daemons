import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ITransaction } from '../../../../messages/transactions/transaction';
import { GetCurrentChain } from '../../data/chain-info';
import { RootState } from '../../state';
import './history.css';

export function History(): JSX.Element {
    const userTransactions = useSelector((state: RootState) => state.history.userTransactions);
    const loading = useSelector((state: RootState) => state.history.loading);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const [selected, setSelected] = useState<string>("");

    const explorerTxUrl = GetCurrentChain(chainId!).explorerTxUrl;

    const transactions = userTransactions.map((tx: ITransaction) => (
        <HistoryEntry key={tx.hash}
            transaction={tx}
            selected={tx.hash === selected}
            setSelected={setSelected}
            explorerTxUrl={explorerTxUrl}
        />
    ));

    return (
        <div className='card history'>
            <div className='card__title'>History</div>
            <div className='history__entries-container'>
                {transactions}
            </div>
        </div>
    );
}


interface IHistoryEntryProps {
    transaction: ITransaction;
    selected: boolean;
    setSelected: React.Dispatch<React.SetStateAction<string>>;
    explorerTxUrl: string;
}

function HistoryEntry({ transaction, selected, setSelected, explorerTxUrl }: IHistoryEntryProps): JSX.Element {
    const date = Intl.DateTimeFormat().format(new Date(transaction.date));

    return (
        <div className={'history-entry ' + (selected ? 'history-entry--selected' : '')}>

            <div className='history-entry__header' onClick={() => setSelected(transaction.hash)}>
                <span className='history-entry__outcome'>{transaction.outcome}</span>
                <span className='history-entry__description'>{transaction.description}</span>
                <span className='history-entry__date'>{date}</span>
            </div>

            {
                selected &&
                <div className='history-entry__body'>
                    <span className='history-entry__cost'>Cost: 0.001 DAEM</span>
                    <a className='history-entry__explorer' href={explorerTxUrl + transaction.hash} target="_blank">Check out</a>
                </div>
            }
        </div>
    );
}
