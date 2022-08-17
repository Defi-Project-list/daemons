import { mumbaiTestnetContracts } from "@daemons-fi/contracts/build";
import { DEX, MoneyMarket, Token } from "../interfaces";

const DAEM = {
    name: "Daemons",
    symbol: "DAEM",
    address: mumbaiTestnetContracts.DaemonsToken,
    decimals: 18,
    logoURI: "/icons/DAEM.svg",
    chainId: "42"
}

const WMATIC = {
    name: "Wrapped MATIC",
    symbol: "WMATIC",
    address: "0xb685400156cF3CBE8725958DeAA61436727A30c3",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
    chainId: "42"
};

const WETH = {
    name: "Wrapped Ether",
    symbol: "WETH",
    address: "0xd575d4047f8c667E064a4ad433D04E25187F40BB",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    chainId: "42"
};

const USDC = {
    name: "Circle USD",
    symbol: "USDC",
    address: "0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2",
    decimals: 6,
    logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    chainId: "42"
};

const DAI = {
    name: "DAI Stablecoin",
    symbol: "DAI",
    address: "0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    chainId: "42"
};

const USDT = {
    name: "Tether USD",
    symbol: "USDT",
    address: "0x21C561e551638401b937b03fE5a0a0652B99B7DD",
    decimals: 6,
    logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
    chainId: "42"
};

const wBTC = {
    name: "Wrapped Bitcoin",
    symbol: "wBTC",
    address: "0x85E44420b6137bbc75a85CAB5c9A3371af976FdE",
    decimals: 8,
    logoURI: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
    chainId: "42"
};


export const mumbaiTokens: Token[] = [
    WMATIC,
    WETH,
    wBTC,
    DAEM,
    USDC,
    USDT,
    DAI
];

export const mumbaiQuickswapDEX: DEX = {
    name: "Quickswap",
    poolAddress: "0x8954AfA98594b838bda56FE4C12a09D7739D179b"
};

export const mumbaiSushiDEX: DEX = {
    name: "Sushi",
    poolAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
};

export const mumbaiDexes: DEX[] = [mumbaiQuickswapDEX, mumbaiSushiDEX];

export const mumbaiAaveMM: MoneyMarket = {
    name: "AAVE",
    poolAddress: "0x6C9fB0D5bD9429eb9Cd96B85B81d872281771E6B",
    isV3: true,
    supportedTokens: [DAI, USDT, USDC, WETH, wBTC, WMATIC],
    mmTokens: {
        // DAI
        [DAI.address]: {
            aToken: "0xDD4f3Ee61466C4158D394d57f3D4C397E91fBc51",
            varDebtToken: "0xB18041Ce2439774c4c7BF611a2a635824cE99032",
            fixDebtToken: "0x333C04243D048836d53b4ACB3c9aE64875699375"
        },

        // USDC
        [USDC.address]: {
            aToken: "0xCdc2854e97798AfDC74BC420BD5060e022D14607",
            varDebtToken: "0xA24A380813FB7E283Acb8221F5E1e3C01052Bc93",
            fixDebtToken: "0x01dBEdcb2437c79341cfeC4Cae765C53BE0E6EF7"
        },

        // USDT
        [USDT.address]: {
            aToken: "0x6Ca4abE253bd510fCA862b5aBc51211C1E1E8925",
            varDebtToken: "0x444672831D8E4A2350667C14E007F56BEfFcB79f",
            fixDebtToken: "0xc601b4d43aF91fE4EAe327a2d2B12f37a568E05B"
        },

        // WBTC
        [wBTC.address]: {
            aToken: "0xde230bC95a03b695be69C44b9AA6C0e9dAc1B143",
            varDebtToken: "0xFDf3B7af2Cb32E5ADca11cf54d53D02162e8d622",
            fixDebtToken: "0x5BcBF666e14eCFe6e21686601c5cA7c7fbe674Cf"
        },

        // WMATIC
        [WMATIC.address]: {
            aToken: "0x89a6AE840b3F8f489418933A220315eeA36d11fF",
            varDebtToken: "0x02a5680AE3b7383854Bf446b1B3Be170E67E689C",
            fixDebtToken: "0xEC59F2FB4EF0C46278857Bf2eC5764485974D17B"
        },

        // WETH
        [WETH.address]: {
            aToken: "0x685bF4eab23993E94b4CFb9383599c926B66cF57",
            varDebtToken: "0xb0c924f61B27cf3C114CBD70def08c62843ebb3F",
            fixDebtToken: "0xC9Ac53b6ae1C653A54ab0E9D44693E807429aF1F"
        },
    }
};
