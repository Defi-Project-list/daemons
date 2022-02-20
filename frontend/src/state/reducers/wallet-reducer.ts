import { ActionType } from "../action-types/index";
import { WalletAction } from '../actions/wallet-actions';

export type WalletState = {
    connected: boolean;
    address?: string;
    chainId?: string;
    authenticated: boolean;
    supportedChain: boolean;
};

const initialState: WalletState = { connected: false, authenticated: false, supportedChain: false };

export const walletReducer = (state: WalletState = initialState, action: WalletAction): WalletState => {
    switch (action.type) {
        case ActionType.WALLET_UPDATE:
            return {
                ...state,
                connected: action.connected,
                address: action.address,
                chainId: action.chainId,
                supportedChain: action.supportedChain,
            };
        case ActionType.AUTH_CHECK:
            return {
                ...state,
                authenticated: action.authenticated,
            };
        default:
            return state;
    }
};
