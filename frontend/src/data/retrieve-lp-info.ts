import { bigNumberToFloat, InfoFetcherABI } from "@daemons-fi/contracts/build";
import { ethers } from "ethers";
import { GetCurrentChain, IsChainSupported, ZeroAddress } from "./chain-info";
import { IToken } from "./chains-data/interfaces";

export interface ILPInfo {
    supported: boolean;
    pairAddress: string;
    reserveA: number;
    reserveB: number;
    userBalance: number;
    isLiquid: boolean;
}

export const retrieveLpInfo = async (
    chainId: string,
    tokenA?: IToken,
    tokenB?: IToken,
    dexRouter?: string,
    userAddress?: string
): Promise<ILPInfo> => {
    if (!tokenA || !tokenB || !dexRouter || !userAddress)
        return {
            supported: false,
            pairAddress: "",
            reserveA: 0,
            reserveB: 0,
            userBalance: 0,
            isLiquid: false
        };

    // Get InfoFetcher contract
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const InfoFetcherAddress = GetCurrentChain(chainId).contracts.InfoFetcher;
    const infoFetcher = new ethers.Contract(InfoFetcherAddress, InfoFetcherABI, provider);

    const rawLPInfo = await infoFetcher.fetchLpInfo(
        tokenA.address,
        tokenB.address,
        dexRouter,
        userAddress
    );

    // if pair is not supported, we report it
    if (rawLPInfo.pairAddress === ZeroAddress) {
        return {
            supported: false,
            pairAddress: ZeroAddress,
            reserveA: 0,
            reserveB: 0,
            userBalance: 0,
            isLiquid: false
        };
    }

    const rawReserveA =
        ethers.utils.getAddress(tokenA.address) === rawLPInfo.token0
            ? rawLPInfo.reserve0
            : rawLPInfo.reserve1;
    const rawReserveB =
        ethers.utils.getAddress(tokenB.address) === rawLPInfo.token0
            ? rawLPInfo.reserve0
            : rawLPInfo.reserve1;

    const reserveA = bigNumberToFloat(rawReserveA, 4, tokenA.decimals);
    const reserveB = bigNumberToFloat(rawReserveB, 4, tokenB.decimals);

    const isLiquid =
        (!!tokenA.minInLpToBeLiquid && reserveA > tokenA.minInLpToBeLiquid) ||
        (!!tokenB.minInLpToBeLiquid && reserveB > tokenB.minInLpToBeLiquid);

    return {
        supported: true,
        pairAddress: rawLPInfo.pairAddress,
        reserveA,
        reserveB,
        userBalance: bigNumberToFloat(rawLPInfo.balance),
        isLiquid
    };
};
