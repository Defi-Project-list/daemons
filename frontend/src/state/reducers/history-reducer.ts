import { ITransaction } from '../../../../shared-definitions/transactions/transaction';
import { ActionType } from "../action-types/index";
import { TransactionAction } from '../actions/transactions-actions';

export type TransactionState = {
    userTransactions: ITransaction[];
    loading: boolean;
};

const initialState: TransactionState = {
    userTransactions: [],
    loading: false,
};

export const historyReducer = (state: TransactionState = initialState, action: TransactionAction): TransactionState => {
    switch (action.type) {
        case ActionType.FETCH_TRANSACTIONS:
            return {
                ...state,
                userTransactions: action.payload,
                loading: false,
            };
        case ActionType.UPDATE_TRANSACTION:
            const newTransaction = action.payload;
            const indexOfTransaction = state.userTransactions.findIndex(tx => tx.hash === newTransaction.hash);
            if (indexOfTransaction === -1) return state;

            const updatedTransactions = [...state.userTransactions];
            updatedTransactions[indexOfTransaction] = newTransaction;
            return {
                ...state,
                userTransactions: updatedTransactions,
            };
        case ActionType.SET_TRANSACTIONS_LOADING:
            return {
                ...state,
                loading: true,
            };
        default:
            return state;
    }
};
