import { ActionType } from "../action-types/index";
import { TreasuryAction } from "../actions/treasury-actions";

export type TreasuryState = {
    redistributionPool?: number;
    stakedAmount?: number;
    distrInterval?: number;
};

const initialState: TreasuryState = {};

export const treasuryReducer = (
    state: TreasuryState = initialState,
    action: TreasuryAction
): TreasuryState => {
    switch (action.type) {
        case ActionType.FETCH_TREASURY_STATS:
        return {
                ...state,
                redistributionPool: action.redistributionPool,
                stakedAmount: action.stakedAmount,
                distrInterval: action.distrInterval
            };
        default:
            return state;
    }
};
