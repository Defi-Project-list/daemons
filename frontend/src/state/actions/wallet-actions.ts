import { IUser } from "../../data/storage-proxy/auth-proxy";
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
    user?: IUser;
}

export interface IFetchDaemBalance {
    type: ActionType.FETCH_DAEM_BALANCE;
    balance: number;
}

export interface IEthDaemBalance {
    type: ActionType.FETCH_ETH_BALANCE;
    balance: number;
}

export interface ISetTxAsSeen {
    type: ActionType.SET_TX_AS_SEEN;
}

export type WalletAction =
    | IUpdateWalletAction
    | IAuthCheck
    | IFetchDaemBalance
    | IEthDaemBalance
    | ISetTxAsSeen;
