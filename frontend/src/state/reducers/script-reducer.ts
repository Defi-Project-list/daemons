import { BaseScript } from "@daemons-fi/scripts-definitions";
import { ActionType } from "../action-types/index";
import { ScriptAction } from "../actions/script-actions";

export type ScriptState = {
    userScripts: BaseScript[];
};

const initialState: ScriptState = {
    userScripts: []
};

export const scriptReducer = (
    state: ScriptState = initialState,
    action: ScriptAction
): ScriptState => {
    switch (action.type) {
        case ActionType.FETCH_USER_SCRIPTS:
            return {
                ...state,
                userScripts: action.payload
            };
        case ActionType.NEW_USER_SCRIPT:
            return {
                ...state,
                userScripts: state.userScripts.concat(action.payload)
            };
        case ActionType.REMOVE_USER_SCRIPT:
            const userScriptToRemove = action.payload.getId();
            return {
                ...state,
                userScripts: state.userScripts.filter(
                    (script) => script.getId() !== userScriptToRemove
                )
            };
        default:
            return state;
    }
};
