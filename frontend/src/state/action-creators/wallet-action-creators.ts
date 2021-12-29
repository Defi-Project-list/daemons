import { Dispatch } from 'redux';;
import { ActionType } from '../action-types';
import { WalletAction } from '../actions/wallet-actions';


export const updateWalletAddress = (address: string | null) => {

    return (dispatch: Dispatch<WalletAction>) => {
        dispatch({
            type: ActionType.WALLET_ADDRESS_UPDATE,
            payload: address,
        });
    };
};
