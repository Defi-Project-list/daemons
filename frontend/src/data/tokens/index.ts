export interface IToken {
    name: string;
    symbol: string;
    address: string;
    logoURI: string;
    decimals: number;
    hasPriceFeed?: boolean;
}

export type Token = IToken;

export type TokenWithAToken = {
    token: Token;
    aToken: Token;
};

export type MarketMaker = {
    name: string;
    poolAddress: string;
    supportedTokens: TokenWithAToken[];
};
