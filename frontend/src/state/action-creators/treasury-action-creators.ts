import { Dispatch } from "redux";
import { ActionType } from "../action-types";
import { treasuryABI } from "@daemons-fi/contracts";
import { ethers } from "ethers";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { bigNumberToFloat } from "@daemons-fi/contracts";
import { Cacher } from "../../data/cacher";
import { TreasuryAction } from "../actions/treasury-actions";

const getTreasuryContract = (chainId: string) => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const treasuryAddress = GetCurrentChain(chainId).contracts.Treasury;
    return new ethers.Contract(treasuryAddress, treasuryABI, provider);
};

// Treasury Stats
const fetchTreasuryStatsHelper = async (chainId: string) => {
    const f = async () => {
        const treasury = getTreasuryContract(chainId);
        const redistributionPool = bigNumberToFloat(await treasury.redistributionPool(), 6);
        const stakedAmount = bigNumberToFloat(await treasury.stakedAmount(), 6);
        const distrInterval = (await treasury.redistributionInterval()).toNumber();
        return { redistributionPool, stakedAmount, distrInterval };
    };
    return await Cacher.fetchData(`B/treasury-stats/${chainId}`, f);
};

export const fetchTreasuryStats = (chainId?: string) => {
    return async (dispatch: Dispatch<TreasuryAction>) => {
        if (!chainId) {
            console.log("ChainId missing, retrieving Treasury stats aborted");
            dispatch({
                type: ActionType.FETCH_TREASURY_STATS
            });
            return;
        }

        console.log("Fetching treasury stats", chainId);
        const stats = await fetchTreasuryStatsHelper(chainId);

        dispatch({
            type: ActionType.FETCH_TREASURY_STATS,
            redistributionPool: stats.redistributionPool,
            distrInterval: stats.distrInterval,
            stakedAmount: stats.stakedAmount
        });
    };
};
