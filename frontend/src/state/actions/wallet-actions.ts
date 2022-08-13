import { ActionType } from "../action-types/index";

export interface IFetchDaemBalance {
    type: ActionType.FETCH_DAEM_BALANCE;
    balance: number;
}

export interface IEthDaemBalance {
    type: ActionType.FETCH_ETH_BALANCE;
    balance: number;
}

export interface IFetchTokenBalances {
    type: ActionType.FETCH_TOKEN_BALANCES;
    balances: {[address: string]: number};
}

export type WalletAction = IFetchDaemBalance | IEthDaemBalance | IFetchTokenBalances;
