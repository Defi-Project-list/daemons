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
