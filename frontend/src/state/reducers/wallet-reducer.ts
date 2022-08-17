import { ActionType } from "../action-types/index";
import { WalletAction } from "../actions/wallet-actions";

export type WalletState = {
    DAEMBalance: number;
    ETHBalance: number;
    tokenBalances: { [address: string]: number };
};

const initialState: WalletState = {
    DAEMBalance: 0,
    ETHBalance: 0,
    tokenBalances: {}
};

export const walletReducer = (
    state: WalletState = initialState,
    action: WalletAction
): WalletState => {
    switch (action.type) {
        case ActionType.FETCH_DAEM_BALANCE:
            return {
                ...state,
                DAEMBalance: action.balance
            };
        case ActionType.FETCH_ETH_BALANCE:
            return {
                ...state,
                ETHBalance: action.balance
            };
        case ActionType.FETCH_BALANCES:
            return {
                ...state,
                ETHBalance: action.coinBalance,
                tokenBalances: action.tokenBalances
            };
        default:
            return state;
    }
};
