import { ActionType } from "../action-types/index";
import { WalletAction } from '../actions/wallet-actions';

export type WalletState = {
    connected: boolean;
    address?: string;
    chainId?: string;
};

const initialState: WalletState = { connected: false };

export const walletReducer = (state: WalletState = initialState, action: WalletAction): WalletState => {
    switch (action.type) {
        case ActionType.WALLET_UPDATE:
            return {
                ...state,
                connected: action.connected,
                address: action.address,
                chainId: action.chainId,
            };
        default:
            return state;
    }
};
