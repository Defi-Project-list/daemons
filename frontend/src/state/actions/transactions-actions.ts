import { ITransaction } from '@daemons-fi/shared-definitions';
import { ActionType } from "../action-types/index";

export interface IFetchTransactionsAction {
    type: ActionType.FETCH_TRANSACTIONS;
    payload: ITransaction[];
}

export interface IUpdateTransactionAction {
    type: ActionType.UPDATE_TRANSACTION;
    payload: ITransaction;
}

export interface IToggleTransactionsLoading {
    type: ActionType.SET_TRANSACTIONS_LOADING;
}

export type TransactionAction = IFetchTransactionsAction | IUpdateTransactionAction | IToggleTransactionsLoading;
