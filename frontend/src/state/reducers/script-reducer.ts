import { BaseScript } from '../../data/script/base-script';
import { ActionType } from "../action-types/index";
import { ScriptAction } from "../actions/script-actions";

export type ScriptState = {
    userScripts: BaseScript[],
    allScripts: BaseScript[];
};

const initialState: ScriptState = {
    userScripts: [],
    allScripts: [],
};

export const scriptReducer = (state: ScriptState = initialState, action: ScriptAction): ScriptState => {
    switch (action.type) {
        case ActionType.FETCH_USER_SCRIPTS:
            return {
                ...state,
                userScripts: action.payload,
            };
        case ActionType.FETCH_ALL_SCRIPTS:
            return {
                ...state,
                allScripts: action.payload,
            };
        case ActionType.NEW_SCRIPT:
            return {
                ...state,
                userScripts: state.userScripts.concat(action.payload),
            };
        default:
            return state;
    }
};
