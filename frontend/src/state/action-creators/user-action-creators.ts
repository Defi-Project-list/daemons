import { Dispatch } from "redux";
import { StorageProxy } from "../../data/storage-proxy";
import { ActionType } from "../action-types";
import { UserAction } from "../actions/user-actions";

export const updateWalletAddress = (
    connected: boolean,
    supportedChain: boolean,
    address?: string,
    chainId?: string
) => {
    return (dispatch: Dispatch<UserAction>) => {
        dispatch({
            type: ActionType.WALLET_UPDATE,
            connected,
            address,
            chainId,
            supportedChain
        });
    };
};

export const authenticationCheck = (address?: string, chainId?: string) => {
    return async (dispatch: Dispatch<UserAction>) => {
        const userProfile =
            address && chainId
                ? await StorageProxy.auth.checkAuthentication(address, chainId)
                : undefined;
        dispatch({
            type: ActionType.FETCH_USER,
            userProfile: userProfile
        });
    };
};

export const clearUnseenTransactions = () => {
    return async (dispatch: Dispatch<UserAction>) => {
        dispatch({
            type: ActionType.SET_TX_AS_SEEN
        });
    };
};

export const updateUsername = (newUsername: string) => {
    return async (dispatch: Dispatch<UserAction>) => {
        dispatch({
            type: ActionType.UPDATE_USERNAME,
            username: newUsername
        });
    };
};
