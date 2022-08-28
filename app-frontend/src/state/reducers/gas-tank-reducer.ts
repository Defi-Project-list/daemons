import { ActionType } from "../action-types/index";
import { GasTankAction } from '../actions/gas-tank-actions';

export type GasTankState = {
    balance?: number;
    claimable?: number;
};

const initialState: GasTankState = {};

export const gasTankReducer = (state: GasTankState = initialState, action: GasTankAction): GasTankState => {
    switch (action.type) {
        case ActionType.GAS_TANK_BALANCE:
            return {
                ...state,
                balance: action.balance,
            };
        case ActionType.GAS_TANK_CLAIMABLE:
            return {
                ...state,
                claimable: action.balance,
            };
        default:
            return state;
    }
};
