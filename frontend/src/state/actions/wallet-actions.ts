import { ActionType } from "../action-types/index";

export interface IUpdateWalletAddressAction {
    type: ActionType.WALLET_ADDRESS_UPDATE;
    payload: string | null;
}

export type WalletAction = IUpdateWalletAddressAction;
