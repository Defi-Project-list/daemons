import { IContractsList } from "@daemons-fi/addresses/build";
import { IScriptActionForm } from "./action-form-interfaces";
import { IScriptConditionForm } from "./condition-form-interfaces";

export interface IToken {
    name: string;
    symbol: string;
    address: string;
    logoURI: string;
    decimals: number;
    hasPriceFeed?: boolean;
}

export type Token = IToken;

export type MoneyMarket = {
    name: string;
    poolAddress: string;
    supportedTokens: Token[];
    mmTokens: {
        [tokenAddress: string]: { aToken: string; varDebtToken: string; fixDebtToken: string };
    };
};

export type DEX = {
    name: string;
    poolAddress: string;
};

export interface IAction {
    title: string;
    info: string;
    conditions: ICondition[];
    form: IScriptActionForm;
}

export interface ICondition {
    title: string;
    info: string;
    form: IScriptConditionForm;
}

export enum ConditionTitles {
    FREQUENCY = "Frequency",
    BALANCE = "Balance",
    PRICE = "Price",
    REPETITIONS = "Repetitions",
    FOLLOW = "Chain Scripts",
    HEALTH_FACTOR = "Health Factor"
}

export interface IChainInfo {
    name: string;
    id: string;
    hex: string;
    defaultRPC: string;
    iconPath: string;
    coinName: string;
    coinSymbol: string;
    coinDecimals: number;
    explorerUrl: string;
    explorerTxUrl: string;
    tokens: Token[];
    contracts: IContractsList;
    actions: IAction[];
}
