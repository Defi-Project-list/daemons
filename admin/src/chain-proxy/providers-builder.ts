import { ethers } from "ethers";
import { BaseProvider } from "@ethersproject/providers";
import {
    fantomTestnetContracts,
    IContractsList,
    kovanContracts,
    rinkebyContracts
} from "@daemons-fi/addresses/build";

interface IChainWithContracts {
    chainName: string;
    rpc_url: () => string;
    contracts: IContractsList;
}

export const supportedChains: { [chain: string]: IChainWithContracts } = {
    "42": {
        chainName: "kovan",
        rpc_url: () => process.env.KOVAN_RPC!,
        contracts: kovanContracts
    },
    "4": {
        chainName: "rinkeby",
        rpc_url: () => process.env.RINKEBY_RPC!,
        contracts: rinkebyContracts
    },
    "4002": {
        chainName: "Fantom Testnet",
        rpc_url: () => process.env.FANTOM_TESTNET_RPC!,
        contracts: fantomTestnetContracts
    }
};

const providers: { [chainId: string]: ethers.providers.Provider } = {};

export const getProvider = (chainId: string): ethers.providers.Provider => {
    const chainInfo = supportedChains[chainId];
    if (!chainInfo) throw new Error(`Chain ${chainId} does not seem to be supported`);
    return instantiateProvider(chainInfo.rpc_url());
};

const instantiateProvider = (rpcUrl: string): BaseProvider => {
    if (rpcUrl.startsWith("wss")) return new ethers.providers.WebSocketProvider(rpcUrl);
    return new ethers.providers.JsonRpcProvider(rpcUrl);
};