import { DEX, MoneyMarket, Token } from "../interfaces";

// const WETH = {
//     name: "Wrapped Ether",
//     symbol: "WETH",
//     address: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
//     chainId: "4",
//     hasPriceFeed: true
// };

// const USDC = {
//     name: "Circle USD",
//     symbol: "USDC",
//     address: "0xe22da380ee6b445bb8273c81944adeb6e8450422",
//     decimals: 6,
//     logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
//     chainId: "4",
//     hasPriceFeed: false
// };

// const DAI = {
//     name: "DAI Stablecoin",
//     symbol: "DAI",
//     address: "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
//     chainId: "4",
//     hasPriceFeed: false
// };

// const USDT = {
//     name: "Tether USD",
//     symbol: "USDT",
//     address: "0x13512979ade267ab5100878e2e0f485b568328a4",
//     decimals: 6,
//     logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
//     chainId: "4",
//     hasPriceFeed: false
// };

// const wBTC = {
//     name: "Wrapped Bitcoin",
//     symbol: "wBTC",
//     address: "0xd1b98b6607330172f1d991521145a22bce793277",
//     decimals: 8,
//     logoURI: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
//     chainId: "4",
//     hasPriceFeed: true
// };

// const UNI = {
//     name: "Uniswap",
//     symbol: "UNI",
//     address: "0x075a36ba8846c6b6f53644fdd3bf17e5151789dc",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png",
//     chainId: "4",
//     hasPriceFeed: false
// };

// const BAT = {
//     name: "Basic Attention Token",
//     symbol: "BAT",
//     address: "0x2d12186fbb9f9a8c28b3ffdd4c42920f8539d738",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x0d8775f648430679a709e98d2b0cb6250d2887ef.png",
//     chainId: "4",
//     hasPriceFeed: false
// };

// const MKR = {
//     name: "Maker",
//     symbol: "MKR",
//     address: "0x61e4cae3da7fd189e52a4879c7b8067d7c2cc0fa",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2.png",
//     chainId: "4",
//     hasPriceFeed: false
// };

// const BUSD = {
//     name: "Binance USD",
//     symbol: "BUSD",
//     address: "0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x4fabb145d64652a948d72533023f6e7a623c7c53.png",
//     chainId: "4",
//     hasPriceFeed: false
// };

// const MANA = {
//     name: "Decentraland",
//     symbol: "MANA",
//     address: "0x738dc6380157429e957d223e6333dc385c85fec7",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x0f5d2fb29fb7d3cfee444a200298f468908cc942.png",
//     chainId: "4",
//     hasPriceFeed: false
// };

// const LINK = {
//     name: "Chain Link",
//     symbol: "LINK",
//     address: "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png",
//     chainId: "4",
//     hasPriceFeed: false
// };

const aaveDAI = {
    name: "DAI Stablecoin",
    symbol: "AaveDAI",
    address: "0x4aaded56bd7c69861e8654719195fca9c670eb45",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    chainId: "4",
    hasPriceFeed: false
};

const aaveUSDT = {
    name: "Tether USD",
    symbol: "aaveUSDT",
    address: "0x326005cfdf58bfb38650396836bebf815f5ab4dd",
    decimals: 18,
    logoURI: "https://app.aave.com/icons/tokens/usdt.svg",
    chainId: "4",
    hasPriceFeed: false
};

export const rinkebyTokens: Token[] = [
    // WETH,
    // wBTC,
    // USDC,
    // USDT,
    // DAI,
    // MANA,
    // MKR,
    // BAT,
    // LINK,
    // BUSD,
    // UNI,
    aaveDAI,
    aaveUSDT,
];

export const rinkebySushiDEX: DEX = {
    name: "Sushi",
    poolAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
}

export const rinkebyAaveMM: MoneyMarket = {
    name: "AAVE",
    poolAddress: "0xe039bdf1d874d27338e09b55cb09879dedca52d8",
    supportedTokens: [aaveDAI, aaveUSDT],
    mmTokens: {
        // DAI
        [aaveDAI.address]: {
            aToken: "0x49866611AA7Dc30130Ac6A0DF29217D16FD87bc0",
            varDebtToken: "0x37768F60EfcFF96188530B022e3DE9d168c2c8E8",
            fixDebtToken: "0x0F48c09701B6D24d6D9571637758EE06eeCb9630"
        },

        // BUSD
        [aaveUSDT.address]: {
            aToken: "0x377D3F732CBeB84D0EebF71e1a4e3546Da86C76d",
            varDebtToken: "0x427cd2ad9Fe0B63ec26Df3aA83D4048149B3DCB3",
            fixDebtToken: "0xCC28d19D8e8A64D2Fc1709e8FE7b6139e25Fd524"
        },

        // WETH
        // [WETH.address]: {
        //     aToken: "0x87b1f4cf9bd63f7bbd3ee1ad04e8f52540349347",
        //     varDebtToken: "0xdd13ce9de795e7facb6fec90e346c7f3abe342e2",
        //     fixDebtToken: "0x0000000000000000000000000000000000000000"
        // },
    }
};
