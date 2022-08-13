import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { ActionType } from "../action-types/index";

export interface IUpdateWalletAction {
    type: ActionType.WALLET_UPDATE;
    connected: boolean;
    address?: string;
    chainId?: string;
    supportedChain: boolean;
}

export interface IAuthCheck {
    type: ActionType.FETCH_USER;
    userProfile?: IUserProfile;
}

export interface ISetTxAsSeen {
    type: ActionType.SET_TX_AS_SEEN;
}

export type UserAction = IUpdateWalletAction | IAuthCheck | ISetTxAsSeen;
