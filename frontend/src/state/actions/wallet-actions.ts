import { ActionType } from "../action-types/index";

export interface IFetchDaemBalance {
    type: ActionType.FETCH_DAEM_BALANCE;
    balance: number;
}

export interface IEthDaemBalance {
    type: ActionType.FETCH_ETH_BALANCE;
    balance: number;
}

export type WalletAction = IFetchDaemBalance | IEthDaemBalance;
