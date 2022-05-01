import { BigNumber, ethers } from "ethers";
import { treasuryABI } from "./treasury";

interface ITreasuryStat {
    apr: number;
    treasury: number;
    staked: number;
    pol: number;
    distributed: number;
    chain: string;
}

interface IChain {
    treasuryAddress: string;
    wsProvider: string;
}

const supportedChains: { [chain: string]: IChain } = {
    kovan: {
        treasuryAddress: "0x9624Ed062eA9C416F196324872b1cD7fF3c149B8",
        wsProvider: "wss://kovan.infura.io/ws/v3/7e8620d1891c4cd38bdc567d79e22cf8"
    }
};

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

export const getTreasuryStats = async (): Promise<ITreasuryStat[]> => {
    const stats: ITreasuryStat[] = [];
    for(const chainName of Object.keys(supportedChains)){
        const chainStat = await getTreasuryStatsForChain(chainName, supportedChains[chainName]);
        stats.push(chainStat);
    }

    return stats;
}



async function getTreasuryStatsForChain(
    chainName: string,
    chainDetails: IChain
): Promise<ITreasuryStat> {
    const provider = new ethers.providers.WebSocketProvider(chainDetails.wsProvider, chainName);
    const treasuryContract = new ethers.Contract(
        chainDetails.treasuryAddress,
        treasuryABI,
        provider
    );

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
