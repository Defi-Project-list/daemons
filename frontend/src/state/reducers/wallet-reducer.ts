import { IUser } from "../../data/storage-proxy/auth-proxy";
import { ActionType } from "../action-types/index";
import { WalletAction } from "../actions/wallet-actions";

export type WalletState = {
    connected: boolean;
    address?: string;
    chainId?: string;
    user?: IUser;
    supportedChain: boolean;
    DAEMBalance: number;
    ETHBalance: number;
};

const initialState: WalletState = {
    connected: false,
    supportedChain: false,
    DAEMBalance: 0,
    ETHBalance: 0
};

export const walletReducer = (
    state: WalletState = initialState,
    action: WalletAction
): WalletState => {
    switch (action.type) {
        case ActionType.WALLET_UPDATE:
            return {
                ...state,
                connected: action.connected,
                address: action.address,
                chainId: action.chainId,
                supportedChain: action.supportedChain
            };
        case ActionType.FETCH_USER:
            return {
                ...state,
                user: action.user
            };
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
        case ActionType.SET_TX_AS_SEEN:
            if (!state.user) return { ...state };
            const userWithSeenTxs = { ...state.user, unseenTransactions: 0 };
            return {
                ...state,
                user: userWithSeenTxs
            };
        default:
            return state;
    }
};
