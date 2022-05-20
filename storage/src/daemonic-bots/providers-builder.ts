import { ethers } from "ethers";
import { BaseProvider } from "@ethersproject/providers";

const supportedChains: { [chain: string]: { chainName: string; url: string } } = {
    "42": {
        chainName: "kovan",
        url: "wss://kovan.infura.io/ws/v3/7e8620d1891c4cd38bdc567d79e22cf8"
    },
    "4": {
        chainName: "rinkeby",
        url: "wss://rinkeby.infura.io/ws/v3/7e8620d1891c4cd38bdc567d79e22cf8"
    },
    "4002": {
        chainName: "Fantom Testnet",
        url: "https://rpc.testnet.fantom.network/"
    }
};

const providers: { [chainId: string]: ethers.providers.Provider } = {};

export const getProvider = (chainId: string): ethers.providers.Provider => {
    if (!providers[chainId]) {
        const chainInfo = supportedChains[chainId];
        if (!chainInfo) throw new Error(`Chain ${chainId} does not seem to be supported`);
        providers[chainId] = instantiateProvider(chainInfo.url);
    }
    return providers[chainId];
};

const instantiateProvider = (rpcUrl: string): BaseProvider => {
    if (rpcUrl.startsWith("wss")) return new ethers.providers.WebSocketProvider(rpcUrl);
    return new ethers.providers.JsonRpcProvider(rpcUrl);
};
