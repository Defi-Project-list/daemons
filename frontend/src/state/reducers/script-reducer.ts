import { BaseScript } from '@daemons-fi/scripts-definitions';
import { ActionType } from "../action-types/index";
import { ScriptAction } from "../actions/script-actions";

export type ScriptState = {
    userScripts: BaseScript[];
    allScripts: BaseScript[];
    loading: boolean;
};

const initialState: ScriptState = {
    userScripts: [],
    allScripts: [],
    loading: false,
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
                loading: false,
            };
        case ActionType.NEW_SCRIPT:
            return {
                ...state,
                userScripts: state.userScripts.concat(action.payload),
            };
        case ActionType.REMOVE_SCRIPT:
            const scriptToRemove = action.payload.getId();
            return {
                ...state,
                userScripts: state.userScripts.filter(script => script.getId() !== scriptToRemove),
            };
        case ActionType.SET_SCRIPTS_LOADING:
            return {
                ...state,
                loading: true,
            };
        default:
            return state;
    }
};
