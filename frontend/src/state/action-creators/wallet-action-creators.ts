import { Dispatch } from 'redux';;
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
