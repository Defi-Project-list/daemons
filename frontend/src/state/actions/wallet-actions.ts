import { ActionType } from "../action-types/index";

export interface IUpdateWalletAction {
    type: ActionType.WALLET_UPDATE;
    connected: boolean;
    address?: string;
    chainId?: string;
}

export type WalletAction = IUpdateWalletAction;
