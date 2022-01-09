import { Dispatch } from 'redux';
import { fetchScriptsForUser } from '../../data/fakeMongoDb';
import { ActionType } from '../action-types';
import { ScriptAction } from '../actions/script-actions';


export const fetchScripts = (address: string | null) => {

    return (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.FETCH_SCRIPTS,
            payload: fetchScriptsForUser(address ?? ''),
        });
    };
};
