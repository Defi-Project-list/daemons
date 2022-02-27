interface IChainInfo {
    name: string;
    hex: string;
    iconPath: string;
    coinSymbol: string;
    explorerTxUrl: string;
}

const unsupportedChain: IChainInfo = {
    name: "Unsupported",
    hex: "0x00",
    iconPath: "",
    coinSymbol: 'ETH',
    explorerTxUrl: 'https://kovan.etherscan.io/tx/'
};

export const ChainInfo: { [chainId: string]: IChainInfo; } = {
    "42": {
        name: "Kovan",
        hex: "0x2a",
        iconPath: "/icons/kovan.jpg",
        coinSymbol: 'ETH',
        explorerTxUrl: 'https://kovan.etherscan.io/tx/'
    },
};

export const GetCurrentChain = (chainId: string): IChainInfo =>
    IsChainSupported(chainId) ? ChainInfo[chainId] : unsupportedChain;

export const IsChainSupported = (chainId: string): boolean =>
    !!ChainInfo[chainId];


export const ZeroAddress = '0x0000000000000000000000000000000000000000';
