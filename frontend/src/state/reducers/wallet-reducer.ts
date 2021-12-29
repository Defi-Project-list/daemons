import { ActionType } from "../action-types/index";
import { WalletAction } from '../actions/wallet-actions';

export type WalletAddressState = string | null;

const initialState: WalletAddressState = null;

export const walletReducer = (state: WalletAddressState = initialState, action: WalletAction): WalletAddressState => {
    switch (action.type) {
        case ActionType.WALLET_ADDRESS_UPDATE:
            return action.payload;
        default:
            return state;
    }
};
