import { IScript } from '../../data/fakescripts';
import { ActionType } from "../action-types/index";

export interface IFetchScriptsAction {
    type: ActionType.FETCH_SCRIPTS;
    payload: IScript[];
}

export interface INewScriptsAction {
    type: ActionType.NEW_SCRIPT;
    payload: IScript;
}

export type ScriptAction = IFetchScriptsAction | INewScriptsAction;
