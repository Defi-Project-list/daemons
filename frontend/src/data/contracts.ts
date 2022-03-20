interface IContractsList {
    GasTank: string;
    DAEMToken: string;
    Treasury: string;
    GasPriceFeed: string;
    PriceRetriever: string;
    AavePool: string;

    // executors
    SwapExecutor: string;
    TransferExecutor: string;
    MmBaseExecutor: string;
    MmAdvancedExecutor: string;
}

const KovanContracts: IContractsList = {
    GasTank: '0x9E3B12384b0394Eb4AdD62E0Fd417B4281C02116',
    DAEMToken: '0x568f91A0d586C03B59de93EC2964CBdE05b53FB4',
    Treasury: '0x9624Ed062eA9C416F196324872b1cD7fF3c149B8',
    GasPriceFeed: '0x51Facf7Ea87460824b9a706faBF62217aB329F38',
    PriceRetriever: '0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136',
    AavePool: '0x5c7551c20ae5a48fd8bedd3bc202e5fd6584021d',

    SwapExecutor: '0x89d0A18420B78F87daF6Fe14DC39d948017A7f22',
    TransferExecutor: '0x1f425edE1C610C6d5C5bc5E6a6B2De7386914FA7',
    MmBaseExecutor: '0x9b2F98AEdbB31Bbd5E443aCB1f2A61a1CBB4318a',
    MmAdvancedExecutor: '0x074cC149D5fdF427c65a1f3E83dde9815DCa3376',
};

export const Contracts: { [chain: string]: IContractsList; } = {
    "42": KovanContracts,
};
