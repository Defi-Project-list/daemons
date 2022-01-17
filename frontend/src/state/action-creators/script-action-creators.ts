import { Dispatch } from 'redux';
import { StorageProxy } from '../../data/storage-proxy';
import { ActionType } from '../action-types';
import { ScriptAction } from '../actions/script-actions';


export const fetchUserScripts = (address?: string) => {

    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.FETCH_USER_SCRIPTS,
            payload: await StorageProxy.fetchUserScripts(address),
        });
    };
};

export const fetchAllScripts = () => {

    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.FETCH_ALL_SCRIPTS,
            payload: await StorageProxy.fetchScripts(),
        });
    };
};
