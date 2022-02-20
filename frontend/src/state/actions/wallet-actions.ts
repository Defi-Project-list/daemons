import { ActionType } from "../action-types/index";

export interface IUpdateWalletAction {
    type: ActionType.WALLET_UPDATE;
    connected: boolean;
    address?: string;
    chainId?: string;
}

export interface IAuthCheck {
    type: ActionType.AUTH_CHECK;
    authenticated: boolean;
}

export type WalletAction = IUpdateWalletAction | IAuthCheck;
