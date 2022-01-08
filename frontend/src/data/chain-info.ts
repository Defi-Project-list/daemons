interface IChainInfo {
    blocksPerDay: number;
}

export const ChainInfo: { [chain: string]: IChainInfo; } = {
    Ethereum: { blocksPerDay: 6300 },
    Kovan: { blocksPerDay: 6300 },
};

export const ZeroAddress = '0x0000000000000000000000000000000000000000';
