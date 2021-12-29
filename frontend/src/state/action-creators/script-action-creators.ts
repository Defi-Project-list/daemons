import { Dispatch } from 'redux';
import { SCRIPTS } from '../../data/fakescripts';
import { ActionType } from '../action-types';
import { ScriptAction } from '../actions/script-actions';


export const fetchScripts = (address: string | null) => {

    return (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.FETCH_SCRIPTS,
            payload: SCRIPTS.filter(script => script.address.toLowerCase() === address),
        });
    };
};
