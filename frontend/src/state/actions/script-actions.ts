import { BaseScript } from '../../data/script/base-script';
import { ActionType } from "../action-types/index";

export interface IFetchScriptsAction {
    type: ActionType.FETCH_SCRIPTS;
    payload: BaseScript[];
}

export interface INewScriptsAction {
    type: ActionType.NEW_SCRIPT;
    payload: BaseScript;
}

export type ScriptAction = IFetchScriptsAction | INewScriptsAction;
