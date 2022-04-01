import { MoneyMarket, Token } from '.';

const WETH = {
    name: "Wrapped Ether",
    symbol: "WETH",
    address: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    chainId: '42',
    hasPriceFeed: true,
};

const USDC = {
    name: "Circle USD",
    symbol: "USDC",
    address: "0xe22da380ee6b445bb8273c81944adeb6e8450422",
    decimals: 6,
    logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    chainId: '42',
    hasPriceFeed: false,
};

const DAI = {
    name: "DAI Stablecoin",
    symbol: "DAI",
    address: "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    chainId: '42',
    hasPriceFeed: false,
};

const USDT = {
    name: "Tether USD",
    symbol: "USDT",
    address: "0x13512979ade267ab5100878e2e0f485b568328a4",
    decimals: 6,
    logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
    chainId: '42',
    hasPriceFeed: false,
};

const wBTC = {
    name: "Wrapped Bitcoin",
    symbol: "wBTC",
    address: "0xd1b98b6607330172f1d991521145a22bce793277",
    decimals: 8,
    logoURI: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
    chainId: '42',
    hasPriceFeed: true,
};

const UNI = {
    name: "Uniswap",
    symbol: "UNI",
    address: "0x075a36ba8846c6b6f53644fdd3bf17e5151789dc",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png",
    chainId: '42',
    hasPriceFeed: false,
};

const BAT = {
    name: "Basic Attention Token",
    symbol: "BAT",
    address: "0x2d12186fbb9f9a8c28b3ffdd4c42920f8539d738",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x0d8775f648430679a709e98d2b0cb6250d2887ef.png",
    chainId: '42',
    hasPriceFeed: false,
};

const MKR = {
    name: "Maker",
    symbol: "MKR",
    address: "0x61e4cae3da7fd189e52a4879c7b8067d7c2cc0fa",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2.png",
    chainId: '42',
    hasPriceFeed: false,
};

const BUSD = {
    name: "Binance USD",
    symbol: "BUSD",
    address: "0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x4fabb145d64652a948d72533023f6e7a623c7c53.png",
    chainId: '42',
    hasPriceFeed: false,
};

const MANA = {
    name: "Decentraland",
    symbol: "MANA",
    address: "0x738dc6380157429e957d223e6333dc385c85fec7",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x0f5d2fb29fb7d3cfee444a200298f468908cc942.png",
    chainId: '42',
    hasPriceFeed: false,
};

const LINK = {
    name: "Chain Link",
    symbol: "LINK",
    address: "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png",
    chainId: '42',
    hasPriceFeed: false,
};

const aaveDAI = {
    name: "DAI Stablecoin",
    symbol: "AaveDAI",
    address: "0x58Cd851c28dF05Edc7F018B533C0257DE57673f7",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    chainId: '42',
    hasPriceFeed: false,
};

const aDAI = {
    name: "AAVE aDAI",
    symbol: "aDAI",
    address: "0xE101EcB2283Acf0C91e05A428DDD8833Ac66B572",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    chainId: '42',
    hasPriceFeed: false,
};

const aWETH = {
    name: "AAVE aWETH",
    symbol: "aWETH",
    address: "0x87b1f4cf9bd63f7bbd3ee1ad04e8f52540349347",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    chainId: '42',
    hasPriceFeed: true,
};

export const kovanTokens: Token[] = [
    WETH, wBTC, USDC, USDT, DAI, MANA, MKR, BAT, LINK, BUSD, UNI, aaveDAI
];

export const kovanAaveMM: MoneyMarket = {
    name: "AAVE",
    poolAddress: "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe",
    supportedTokens: [aaveDAI, WETH],
    aTokens: {
        "0x58Cd851c28dF05Edc7F018B533C0257DE57673f7": aDAI,
        "0xd0a1e359811322d97991e03f863a0c30c2cf029c": aWETH,
    }
};
