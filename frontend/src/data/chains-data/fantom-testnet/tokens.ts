import { DEX, MoneyMarket, Token } from "../interfaces";

const WFTM = {
    name: "Wrapped Fantom",
    symbol: "WFTM",
    address: "0xF7475b635EbE06d9C5178CC40D50856Fa98C7332",
    decimals: 18,
    logoURI: "https://app.aave.com/icons/tokens/wftm.svg",
    chainId: "42"
};

// const USDC = {
//     name: "Circle USD",
//     symbol: "USDC",
//     address: "0xe22da380ee6b445bb8273c81944adeb6e8450422",
//     decimals: 6,
//     logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
//     chainId: "42"
// };

// const DAI = {
//     name: "DAI Stablecoin",
//     symbol: "DAI",
//     address: "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
//     chainId: "42"
// };

// const USDT = {
//     name: "Tether USD",
//     symbol: "USDT",
//     address: "0x13512979ade267ab5100878e2e0f485b568328a4",
//     decimals: 6,
//     logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
//     chainId: "42"
// };

const wBTC = {
    name: "Wrapped Bitcoin",
    symbol: "wBTC",
    address: "0xd0404A349A76CD2a4B7AB322B9a6C993dbC3A7E7",
    decimals: 8,
    logoURI: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
    chainId: "42"
};

// const UNI = {
//     name: "Uniswap",
//     symbol: "UNI",
//     address: "0x075a36ba8846c6b6f53644fdd3bf17e5151789dc",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png",
//     chainId: "42"
// };

// const BAT = {
//     name: "Basic Attention Token",
//     symbol: "BAT",
//     address: "0x2d12186fbb9f9a8c28b3ffdd4c42920f8539d738",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x0d8775f648430679a709e98d2b0cb6250d2887ef.png",
//     chainId: "42"
// };

// const MKR = {
//     name: "Maker",
//     symbol: "MKR",
//     address: "0x61e4cae3da7fd189e52a4879c7b8067d7c2cc0fa",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2.png",
//     chainId: "42"
// };

// const BUSD = {
//     name: "Binance USD",
//     symbol: "BUSD",
//     address: "0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x4fabb145d64652a948d72533023f6e7a623c7c53.png",
//     chainId: "42"
// };

// const MANA = {
//     name: "Decentraland",
//     symbol: "MANA",
//     address: "0x738dc6380157429e957d223e6333dc385c85fec7",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x0f5d2fb29fb7d3cfee444a200298f468908cc942.png",
//     chainId: "42"
// };

// const LINK = {
//     name: "Chain Link",
//     symbol: "LINK",
//     address: "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
//     decimals: 18,
//     logoURI: "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png",
//     chainId: "42"
// };

const aaveDAI = {
    name: "DAI Stablecoin",
    symbol: "AaveDAI",
    address: "0xc469ff24046779de9b61be7b5df91dbffdf1ae02",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    chainId: "42"
};

const aaveUSDC = {
    name: "USDC Stablecoin",
    symbol: "AaveUSDC",
    address: "0x06f0790c687a1bed6186ce3624edd9806edf9f4e",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x4fabb145d64652a948d72533023f6e7a623c7c53.png",
    chainId: "42"
};

export const fantomTestnetTokens: Token[] = [WFTM, wBTC, aaveUSDC, aaveDAI];

export const fantomTestnetSpookyDEX: DEX = {
    name: "SpookySwap",
    poolAddress: "0xa6AD18C2aC47803E193F75c3677b14BF19B94883"
};

export const fantomTestnetDexes: DEX[] = [fantomTestnetSpookyDEX];

export const fantomTestnetAaveMM: MoneyMarket = {
    name: "AAVE",
    poolAddress: "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe",
    supportedTokens: [aaveDAI, aaveUSDC, WFTM],
    mmTokens: {
        // DAI
        [aaveDAI.address]: {
            aToken: "0xfb08e04e9c7affe693290f739d11d5c3dd2e19b5",
            varDebtToken: "0x78243313999d4582cfee48bd5b4466eff6c90fe1",
            fixDebtToken: "0x87d62612a58a806B926a0A1276DF5C9c6DbE8a5e"
        },

        // USDC
        [aaveUSDC.address]: {
            aToken: "0xf1090cB4f56fDb659D24DDbC4972bE9D379A6E8c",
            varDebtToken: "0x946765C86B534D8114475BFec8De8De481bA4d1F",
            fixDebtToken: "0x7e90CE7a0463cc5656c38B5a85C33dF4C8F2523C"
        },

        // WFTM
        [WFTM.address]: {
            aToken: "0x22FDD5F19C49fe954847A6424E4a24C2742fD9EF",
            varDebtToken: "0x812388F32346e99078B987e84f60dA68348Ac665",
            fixDebtToken: "0x67196249e5fE6c2f532ff456E342Abf8eE19D4E3"
        }
    }
};
