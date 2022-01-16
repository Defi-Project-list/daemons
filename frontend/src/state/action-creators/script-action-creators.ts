import { Dispatch } from 'redux';
import { StorageProxy } from '../../data/storage-proxy';
import { ActionType } from '../action-types';
import { ScriptAction } from '../actions/script-actions';


export const fetchScripts = (address?: string) => {

    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.FETCH_SCRIPTS,
            payload: await StorageProxy.fetchUserScripts(address),
        });
    };
};
