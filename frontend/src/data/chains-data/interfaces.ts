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
    aTokens: { [tokenAddress: string]: Token; };
};

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
    moneyMarket: MoneyMarket;
}
