import { UniswapV2FactoryABI, UniswapV2RouterABI } from "@daemons-fi/contracts/build";
import { ethers } from "ethers";

export const retrieveLpAddress = async (
    tokenA?: string,
    tokenB?: string,
    dexRouter?: string
): Promise<string> => {
    if (!tokenA || !tokenB || !dexRouter) return "0x0000000000000000000000000000000000000000";

    // Get DEX router contract
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const dex = new ethers.Contract(dexRouter, UniswapV2RouterABI, provider);

    // Get DEX factory
    const factoryAddress = await dex.factory();
    const factory = new ethers.Contract(factoryAddress, UniswapV2FactoryABI, provider);

    const pairAddress = await factory.getPair(tokenA, tokenB);
    return pairAddress;
};
