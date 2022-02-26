import { BaseScript } from '../../data/script/base-script';
import { ActionType } from "../action-types/index";

export interface IFetchScriptsAction {
    type: ActionType.FETCH_USER_SCRIPTS | ActionType.FETCH_ALL_SCRIPTS;
    payload: BaseScript[];
}

export interface IToggleLoading {
    type: ActionType.SET_LOADING;
}

export interface INewScriptsAction {
    type: ActionType.NEW_SCRIPT;
    payload: BaseScript;
}

export interface IRemoveScriptsAction {
    type: ActionType.REMOVE_SCRIPT;
    payload: BaseScript;
}

export type ScriptAction = IFetchScriptsAction | IToggleLoading | INewScriptsAction | IRemoveScriptsAction;
