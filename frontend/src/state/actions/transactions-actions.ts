import { ITransaction } from '../../../../messages/transactions/transaction';
import { ActionType } from "../action-types/index";

export interface IFetchTransactionsAction {
    type: ActionType.FETCH_TRANSACTIONS;
    payload: ITransaction[];
}

export interface IToggleTransactionsLoading {
    type: ActionType.SET_TRANSACTIONS_LOADING;
}

export type TransactionAction = IFetchTransactionsAction | IToggleTransactionsLoading;
