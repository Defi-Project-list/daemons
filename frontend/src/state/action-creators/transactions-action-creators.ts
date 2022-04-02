import { Dispatch } from 'redux';
import { ITransaction } from '@daemons-fi/shared-definitions';
import { StorageProxy } from '../../data/storage-proxy';
import { ActionType } from '../action-types';
import { TransactionAction } from '../actions/transactions-actions';


export const fetchUserHistory = (chainId?: string, address?: string, page?: number) => {
    return async (dispatch: Dispatch<TransactionAction>) => {
        dispatch({
            type: ActionType.FETCH_TRANSACTIONS,
            payload: await StorageProxy.txs.fetchUserTransactions(chainId, address, page),
        });
    };
};

export const updateSingleTransaction = (transaction: ITransaction) => {
    return async (dispatch: Dispatch<TransactionAction>) => {
        dispatch({
            type: ActionType.UPDATE_TRANSACTION,
            payload: transaction,
        });
    };
};

export const toggleHistoryLoading = () => {
    return async (dispatch: Dispatch<TransactionAction>) => {
        dispatch({
            type: ActionType.SET_TRANSACTIONS_LOADING
        });
    };
};
