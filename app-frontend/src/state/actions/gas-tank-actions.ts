import { ActionType } from "../action-types/index";

export interface IGasTankBalanceAction {
    type: ActionType.GAS_TANK_BALANCE;
    balance?: number;
}

export interface IGasTankClaimableAction {
    type: ActionType.GAS_TANK_CLAIMABLE;
    balance?: number;
}

export type GasTankAction = IGasTankBalanceAction | IGasTankClaimableAction;
