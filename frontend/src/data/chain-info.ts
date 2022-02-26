interface IChainInfo {
    name: string;
    hex: string;
    iconPath: string;
    coinSymbol: string;
}

const unsupportedChain: IChainInfo = {
    name: "Unsupported",
    hex: "0x00",
    iconPath: "",
    coinSymbol: 'ETH',
};

export const ChainInfo: { [chainId: string]: IChainInfo; } = {
    "42": {
        name: "Kovan",
        hex: "0x2a",
        iconPath: "/icons/kovan.jpg",
        coinSymbol: 'ETH',
    },
};

export const GetCurrentChain = (chainId: string): IChainInfo =>
    IsChainSupported(chainId) ? ChainInfo[chainId] : unsupportedChain;

export const IsChainSupported = (chainId: string): boolean =>
    !!ChainInfo[chainId];


export const ZeroAddress = '0x0000000000000000000000000000000000000000';
