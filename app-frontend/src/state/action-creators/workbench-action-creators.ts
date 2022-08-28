import { Dispatch } from 'redux';
import { ICurrentScript } from "../../script-factories/i-current-script";
import { ActionType } from '../action-types';
import { WorkbenchAction } from "../actions/workbench-actions";


export const addScriptToWorkbench = (script: ICurrentScript) => {

    return async (dispatch: Dispatch<WorkbenchAction>) => {
        dispatch({
            type: ActionType.ADD_TO_WORKBENCH,
            payload: script,
        });
    };
};

export const cleanWorkbench = () => {
    return async (dispatch: Dispatch<WorkbenchAction>) => {
        dispatch({
            type: ActionType.CLEAN_WORKBENCH
        });
    };
};
