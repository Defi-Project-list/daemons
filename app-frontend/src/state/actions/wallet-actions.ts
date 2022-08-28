import { IMMInfo } from "../../data/retrieve-mm-info";
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
    type: ActionType.FETCH_BALANCES;
    coinBalance: number;
    tokenBalances: { [address: string]: number };
}

export interface IFetchMMInfo {
    type: ActionType.FETCH_MM_INFO;
    moneyMarketPool?: string;
    mmInfo?: IMMInfo;
}

export interface ICleanMMInfo {
    type: ActionType.CLEAN_MM_INFO;
}

export type WalletAction =
    | IFetchDaemBalance
    | IEthDaemBalance
    | IFetchTokenBalances
    | IFetchMMInfo
    | ICleanMMInfo;
