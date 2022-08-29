import {
    IContractsList,
    kovanContracts,
    mumbaiTestnetContracts
} from "@daemons-fi/contracts/build";

export interface ISimplifiedChainInfo {
    name: string;
    id: string;
    defaultRPC: string;
    iconPath: string;
    coinName: string;
    coinSymbol: string;
    coinDecimals: number;
    coinIconPath: string;
    explorerUrl: string;
    explorerTxUrl: string;
    contracts: IContractsList;
    minCoinsToExecuteScripts: number;
}

export const ChainInfo: { [chainId: string]: ISimplifiedChainInfo } = {
    "42": {
        name: "Kovan",
        id: "42",
        defaultRPC: "https://kovan.infura.io/v3/",
        iconPath: "/icons/kovan.jpg",
        coinName: "Ether",
        coinSymbol: "ETH",
        coinDecimals: 18,
        coinIconPath: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
        explorerUrl: "https://kovan.etherscan.io/",
        explorerTxUrl: "https://kovan.etherscan.io/tx/",
        contracts: kovanContracts,
        minCoinsToExecuteScripts: 0.01,
    },
    "80001": {
        name: "Mumbai",
        id: "80001",
        defaultRPC: "https://rpc-mumbai.maticvigil.com",
        iconPath: "/icons/mumbai.jpg",
        coinName: "Matic",
        coinSymbol: "MATIC",
        coinDecimals: 18,
        coinIconPath: "/icons/polygon.jpg",
        explorerUrl: "https://mumbai.polygonscan.com/",
        explorerTxUrl: "https://mumbai.polygonscan.com/tx/",
        contracts: mumbaiTestnetContracts,
        minCoinsToExecuteScripts: 1,
    }
};

export const GetAvailableChains = (): ISimplifiedChainInfo[] => Object.values(ChainInfo);
