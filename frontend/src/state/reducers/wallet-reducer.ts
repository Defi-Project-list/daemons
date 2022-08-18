import { IMMInfo } from "../../data/retrieve-mm-info";
import { ActionType } from "../action-types/index";
import { WalletAction } from "../actions/wallet-actions";

export type WalletState = {
    DAEMBalance: number;
    ETHBalance: number;
    tokenBalances: { [address: string]: number };
    moneyMarketsInfo: { [moneyMarketPool: string]: IMMInfo };
};

const initialState: WalletState = {
    DAEMBalance: 0,
    ETHBalance: 0,
    tokenBalances: {},
    moneyMarketsInfo: {}
};

export const walletReducer = (
    state: WalletState = initialState,
    action: WalletAction
): WalletState => {
    console.debug("walletReducer triggered");
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
        case ActionType.FETCH_MM_INFO:
            if (!action.mmInfo || !action.moneyMarketPool) return state;
            const newMMInfo = JSON.parse(JSON.stringify(state.moneyMarketsInfo));
            newMMInfo[action.moneyMarketPool] = action.mmInfo;
            return {
                ...state,
                moneyMarketsInfo: newMMInfo
            };
        case ActionType.CLEAN_MM_INFO:
            return {
                ...state,
                moneyMarketsInfo: {}
            };
        default:
            return state;
    }
};
