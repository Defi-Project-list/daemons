import { ActionType } from "../action-types/index";

export interface IStakingBalanceAction {
    type: ActionType.STAKING_BALANCE;
    balance?: number;
}

export interface IStakingClaimableAction {
    type: ActionType.STAKING_CLAIMABLE;
    balance?: number;
}

export type StakingAction = IStakingBalanceAction | IStakingClaimableAction;
