import { ActionType } from "../action-types/index";
import { GasTankAction } from '../actions/gas-tank-actions';

export type GasTankState = {
    balance: number | null;
};

const initialState: GasTankState = {
    balance: null,
};

export const gasTankReducer = (state: GasTankState = initialState, action: GasTankAction): GasTankState => {
    switch (action.type) {
        case ActionType.GAS_TANK_BALANCE:
            return {
                ...state,
                balance: action.balance,
            };
        default:
            return state;
    }
};
