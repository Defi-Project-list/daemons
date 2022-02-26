import { Dispatch } from 'redux';
import { BaseScript } from '../../data/script/base-script';
import { StorageProxy } from '../../data/storage-proxy';
import { ActionType } from '../action-types';
import { ScriptAction } from '../actions/script-actions';


export const fetchUserScripts = (chainId?: string, address?: string) => {

    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.FETCH_USER_SCRIPTS,
            payload: await StorageProxy.fetchUserScripts(chainId, address),
        });
    };
};

export const fetchAllScripts = (chainId?: string) => {

    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.FETCH_ALL_SCRIPTS,
            payload: await StorageProxy.fetchScripts(chainId),
        });
    };
};

export const addNewScript = (script: BaseScript) => {

    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.NEW_SCRIPT,
            payload: script,
        });
    };
};

export const removeScript = (script: BaseScript) => {

    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.REMOVE_SCRIPT,
            payload: script,
        });
    };
};

export const toggleScriptsLoading = () => {
    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.SET_LOADING
        });
    };
};
