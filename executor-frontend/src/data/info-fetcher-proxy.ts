import { ethers } from "ethers";
import { InfoFetcherABI } from "@daemons-fi/contracts";
import { bigNumberToFloat } from "@daemons-fi/contracts";
import { ChainInfo } from "./supported-chains";

export const fetchWalletBalance = async (
    chainId: string,
    walletAddress: string,
    rpcUrl: string
): Promise<{ ETHBalance: number; DAEMBalance: number }> => {
    // fetch chain info
    const chain = ChainInfo[chainId];
    if (!chain) throw new Error(`Chain ${chainId} is not supported!`);

    // get InfoFetcher contract
    const provider = instantiateProvider(rpcUrl);
    const InfoFetcherAddress = chain.contracts.InfoFetcher;
    const InfoFetcher = new ethers.Contract(InfoFetcherAddress, InfoFetcherABI, provider);

    const DAEMtoken = chain.contracts.DaemonsToken;
    const rawBalances = await InfoFetcher.fetchBalances(walletAddress, [DAEMtoken]);

    const ETHBalance = bigNumberToFloat(rawBalances.coin, 5);
    const DAEMBalance = bigNumberToFloat(rawBalances.tokens[0], 4);

    return { ETHBalance, DAEMBalance };
};

export const instantiateProvider = (rpcUrl: string): ethers.providers.JsonRpcProvider => {
    if (rpcUrl.startsWith("wss")) return new ethers.providers.WebSocketProvider(rpcUrl);
    return new ethers.providers.JsonRpcProvider(rpcUrl);
};
