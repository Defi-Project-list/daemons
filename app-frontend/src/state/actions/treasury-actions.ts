import { ActionType } from "../action-types/index";

export interface IFetchTreasuryStats {
    type: ActionType.FETCH_TREASURY_STATS;
    redistributionPool?: number;
    stakedAmount?: number;
    distrInterval?: number;
}

export type TreasuryAction = IFetchTreasuryStats;
