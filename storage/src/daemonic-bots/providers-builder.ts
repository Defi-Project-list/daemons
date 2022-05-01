import { ethers } from "ethers";

const supportedChains: { [chain: string]: { chainName: string; wssUrl: string } } = {
    "42": {
        chainName: "kovan",
        wssUrl: "wss://kovan.infura.io/ws/v3/7e8620d1891c4cd38bdc567d79e22cf8"
    }
};

const providers: { [chainId: string]: ethers.providers.Provider } = {};

export const getProvider = (chainId: string): ethers.providers.Provider => {
    if (!providers[chainId]) {
        const chainInfo = supportedChains[chainId];
        if (!chainInfo) throw new Error(`Chain ${chainId} does not seem to be supported`);
        providers[chainId] = new ethers.providers.WebSocketProvider(
            chainInfo.wssUrl,
            chainInfo.chainName
        );
    }
    return providers[chainId];
};
