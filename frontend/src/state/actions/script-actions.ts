import { BaseScript } from '@daemons-fi/scripts-definitions';
import { ActionType } from "../action-types/index";

export interface IFetchScriptsAction {
    type: ActionType.FETCH_USER_SCRIPTS | ActionType.FETCH_EXECUTABLE_SCRIPTS;
    payload: BaseScript[];
}

export interface IToggleScriptsLoading {
    type: ActionType.SET_SCRIPTS_LOADING;
}

export interface INewScriptsAction {
    type: ActionType.NEW_USER_SCRIPT;
    payload: BaseScript;
}

export interface IRemoveScriptsAction {
    type: ActionType.REMOVE_USER_SCRIPT | ActionType.REMOVE_EXECUTABLE_SCRIPT;
    payload: BaseScript;
}

export type ScriptAction = IFetchScriptsAction | IToggleScriptsLoading | INewScriptsAction | IRemoveScriptsAction;
