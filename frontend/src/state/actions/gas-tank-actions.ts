import { ActionType } from "../action-types/index";

export interface IGasTankBalanceAction {
    type: ActionType.GAS_TANK_BALANCE;
    balance?: number;
}

export type GasTankAction = IGasTankBalanceAction;
