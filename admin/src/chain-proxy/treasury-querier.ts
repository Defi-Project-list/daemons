import { IContractsList } from "@daemons-fi/addresses/build";
import { BigNumber, ethers } from "ethers";
import { treasuryABI } from "@daemons-fi/abis";
import { getProvider, supportedChains } from "./providers-builder";

interface ITreasuryStat {
    apr: number;
    treasury: number;
    staked: number;
    pol: number;
    distributed: number;
    chain: string;
}

export const getTreasuryStats = async (): Promise<ITreasuryStat[]> => {
    const stats: ITreasuryStat[] = [];
    for (const chainId of Object.keys(supportedChains)) {
        const chainStat = await getTreasuryStatsForChain(
            chainId,
            supportedChains[chainId].chainName,
            supportedChains[chainId].contracts
        );
        stats.push(chainStat);
    }
    return stats;
};

async function getTreasuryStatsForChain(
    chainId: string,
    chainName: string,
    chainContracts: IContractsList
): Promise<ITreasuryStat> {
    const provider = getProvider(chainId);
    const treasuryContract = new ethers.Contract(chainContracts.Treasury, treasuryABI, provider);

    const convertToDecimal = (bn: BigNumber) =>
        bn.div(BigNumber.from(10).pow(13)).toNumber() / 100000;

    const treasury = convertToDecimal(await treasuryContract.redistributionPool());
    const staked = convertToDecimal(await treasuryContract.stakedAmount());
    const distrInterval = (await treasuryContract.redistributionInterval()).toNumber();
    const apr = calculateAPY(treasury, staked, 1, distrInterval);

    return {
        apr,
        treasury,
        staked,
        distributed: 0,
        pol: 0,
        chain: chainName
    };
}

const secondsInOneYear = 31104000;
const calculateAPY = (
    toBeDistributed: number,
    staked: number,
    ethWorthOfDaem: number,
    redistributionInterval: number
): number =>
    (((secondsInOneYear / redistributionInterval) * toBeDistributed) / staked) *
    ethWorthOfDaem *
    100;
