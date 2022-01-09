import { BaseScript } from '../../data/script/base-script';
import { ActionType } from "../action-types/index";
import { ScriptAction } from "../actions/script-actions";

export type ScriptState = {
    fetchedScripts: BaseScript[],
    currentScript?: BaseScript,
};

const initialState: ScriptState = {
    fetchedScripts: [],
};

export const scriptReducer = (state: ScriptState = initialState, action: ScriptAction): ScriptState => {
    switch (action.type) {
        case ActionType.FETCH_SCRIPTS:
            return {
                ...state,
                fetchedScripts: action.payload,
            };
        case ActionType.NEW_SCRIPT:
            return {
                ...state,
                currentScript: action.payload,
            };
        default:
            return state;
    }
};
