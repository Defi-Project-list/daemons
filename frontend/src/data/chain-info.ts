import { MoneyMarket, Token } from './tokens';
import { kovanAaveMM, kovanTokens } from './tokens/tokens-kovan';

export interface IChainInfo {
    name: string;
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

const unsupportedChain: IChainInfo = {
    name: "Unsupported",
    hex: "0x00",
    defaultRPC: "",
    iconPath: "/icons/unknown.png",
    coinName: 'Ether',
    coinSymbol: 'ETH',
    coinDecimals: 18,
    explorerUrl: 'https://kovan.etherscan.io/',
    explorerTxUrl: 'https://kovan.etherscan.io/tx/',
    tokens: [],
    moneyMarket: { aTokens: {}, name: "Unsupported", supportedTokens: [], poolAddress: '' },
};

export const ChainInfo: { [chainId: string]: IChainInfo; } = {
    "42": {
        name: "Kovan",
        hex: "0x2a",
        defaultRPC: "https://kovan.infura.io/v3/",
        iconPath: "/icons/kovan.jpg",
        coinName: 'Ether',
        coinSymbol: 'ETH',
        coinDecimals: 18,
        explorerUrl: 'https://kovan.etherscan.io/',
        explorerTxUrl: 'https://kovan.etherscan.io/tx/',
        tokens: kovanTokens,
        moneyMarket: kovanAaveMM,
    },
};

export const GetCurrentChain = (chainId: string): IChainInfo =>
    IsChainSupported(chainId) ? ChainInfo[chainId] : unsupportedChain;

export const IsChainSupported = (chainId: string): boolean =>
    !!ChainInfo[chainId];

export const GetAvailableChains = (): IChainInfo[] =>
    Object.values(ChainInfo);

export const ZeroAddress = '0x0000000000000000000000000000000000000000';
export const ZeroId = '0x0000000000000000000000000000000000000000000000000000000000000000';
