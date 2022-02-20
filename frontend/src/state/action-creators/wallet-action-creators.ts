import { Dispatch } from 'redux'; import { StorageProxy } from '../../data/storage-proxy';
;
import { ActionType } from '../action-types';
import { WalletAction } from '../actions/wallet-actions';


export const updateWalletAddress = (connected: boolean, address?: string, chainId?: string) => {

    return (dispatch: Dispatch<WalletAction>) => {
        dispatch({
            type: ActionType.WALLET_UPDATE,
            connected,
            address,
            chainId,
        });
    };
};

export const authenticationCheck = (address?: string) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        dispatch({
            type: ActionType.AUTH_CHECK,
            // if no address is provided, we don't even bother asking the server
            authenticated: !!address && await StorageProxy.checkAuthentication(address),
        });
    };
};
