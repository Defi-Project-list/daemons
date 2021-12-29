import { Dispatch } from 'redux';
import { SCRIPTS } from '../../data/fakescripts';
import { ActionType } from '../action-types';
import { ScriptAction } from '../actions/script-actions';


export const fetchScripts = (address?: string) => {

    return (dispatch: Dispatch<ScriptAction>) => {
        console.log("Fetching user's scripts...");

        dispatch({
            type: ActionType.FETCH_SCRIPTS,
            payload: SCRIPTS,
        });
    };
};
