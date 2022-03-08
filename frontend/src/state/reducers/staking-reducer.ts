import { ActionType } from "../action-types/index";
import { StakingAction } from '../actions/staking-actions';

export type StakingState = {
    balance?: number;
    claimable?: number;
};

const initialState: StakingState = {};

export const stakingReducer = (state: StakingState = initialState, action: StakingAction): StakingState => {
    switch (action.type) {
        case ActionType.STAKING_BALANCE:
            return {
                ...state,
                balance: action.balance,
            };
        case ActionType.STAKING_CLAIMABLE:
            return {
                ...state,
                claimable: action.balance,
            };
        default:
            return state;
    }
};
