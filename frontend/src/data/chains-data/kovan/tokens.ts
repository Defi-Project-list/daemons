import { kovanContracts } from "@daemons-fi/contracts/build";
import { DEX, IToken, MoneyMarket, Token } from "../interfaces";

const DAEM: IToken = {
    name: "Daemons",
    symbol: "DAEM",
    address: kovanContracts.DaemonsToken,
    decimals: 18,
    logoURI: "/icons/DAEM.svg",
    minInLpToBeLiquid: 10
}

const WETH: IToken = {
    name: "Wrapped Ether",
    symbol: "WETH",
    address: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    minInLpToBeLiquid: 10
};

const USDC: IToken = {
    name: "Circle USD",
    symbol: "USDC",
    address: "0xe22da380ee6b445bb8273c81944adeb6e8450422",
    decimals: 6,
    logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    minInLpToBeLiquid: 1000
};

const DAI: IToken = {
    name: "DAI Stablecoin",
    symbol: "DAI",
    address: "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    minInLpToBeLiquid: 1000
};

const USDT: IToken = {
    name: "Tether USD",
    symbol: "USDT",
    address: "0x13512979ade267ab5100878e2e0f485b568328a4",
    decimals: 6,
    logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
    minInLpToBeLiquid: 1000
};

const wBTC: IToken = {
    name: "Wrapped Bitcoin",
    symbol: "wBTC",
    address: "0xd1b98b6607330172f1d991521145a22bce793277",
    decimals: 8,
    logoURI: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
    minInLpToBeLiquid: 5
};

const UNI: IToken = {
    name: "Uniswap",
    symbol: "UNI",
    address: "0x075a36ba8846c6b6f53644fdd3bf17e5151789dc",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png",
};

const BAT: IToken = {
    name: "Basic Attention Token",
    symbol: "BAT",
    address: "0x2d12186fbb9f9a8c28b3ffdd4c42920f8539d738",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x0d8775f648430679a709e98d2b0cb6250d2887ef.png",
};

const MKR: IToken = {
    name: "Maker",
    symbol: "MKR",
    address: "0x61e4cae3da7fd189e52a4879c7b8067d7c2cc0fa",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2.png",
};

const BUSD: IToken = {
    name: "Binance USD",
    symbol: "BUSD",
    address: "0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x4fabb145d64652a948d72533023f6e7a623c7c53.png",
    minInLpToBeLiquid: 1000
};

const MANA: IToken = {
    name: "Decentraland",
    symbol: "MANA",
    address: "0x738dc6380157429e957d223e6333dc385c85fec7",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x0f5d2fb29fb7d3cfee444a200298f468908cc942.png",
};

const LINK: IToken = {
    name: "Chain Link",
    symbol: "LINK",
    address: "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png",
};

const aaveDAI: IToken = {
    name: "DAI Stablecoin",
    symbol: "AaveDAI",
    address: "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    minInLpToBeLiquid: 1000
};

const aaveBUSD: IToken = {
    name: "BUSD Stablecoin",
    symbol: "AaveBUSD",
    address: "0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x4fabb145d64652a948d72533023f6e7a623c7c53.png",
    minInLpToBeLiquid: 1000
};

export const kovanTokens: Token[] = [
    WETH,
    wBTC,
    DAEM,
    USDC,
    USDT,
    DAI,
    MANA,
    MKR,
    BAT,
    LINK,
    BUSD,
    UNI,
    aaveDAI
];

export const kovanSushiDEX: DEX = {
    name: "Sushi",
    poolAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
};

export const kovanDexes: DEX[] = [kovanSushiDEX];

export const kovanAaveMM: MoneyMarket = {
    name: "AAVE",
    poolAddress: "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe",
    isV3: false,
    supportedTokens: [aaveDAI, aaveBUSD, WETH],
    mmTokens: {
        // DAI
        [aaveDAI.address]: {
            aToken: "0xdcf0af9e59c002fa3aa091a46196b37530fd48a8",
            varDebtToken: "0xeabbdbe7aad7d5a278da40967e62c8c8fe5faec8",
            fixDebtToken: "0x3b91257fe5ca63b4114ac41a0d467d25e2f747f3"
        },

        // BUSD
        [aaveBUSD.address]: {
            aToken: "0xfe3e41db9071458e39104711ef1fa668bae44e85",
            varDebtToken: "0xb85ecad7a9c9f09749cecf84122189a7908ec934",
            fixDebtToken: "0x597c5d0390e7e995d36f2e49f9ed979697723be9"
        },

        // WETH
        [WETH.address]: {
            aToken: "0x87b1f4cf9bd63f7bbd3ee1ad04e8f52540349347",
            varDebtToken: "0xdd13ce9de795e7facb6fec90e346c7f3abe342e2",
            fixDebtToken: "0x0000000000000000000000000000000000000000"
        }
    }
};
