import { Dispatch } from 'redux';
import { BaseScript } from '@daemons-fi/scripts-definitions';
import { StorageProxy } from '../../data/storage-proxy';
import { ActionType } from '../action-types';
import { ScriptAction } from '../actions/script-actions';


export const fetchUserScripts = (chainId?: string, address?: string) => {

    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.FETCH_USER_SCRIPTS,
            payload: await StorageProxy.script.fetchUserScripts(chainId, address),
        });
    };
};

export const addNewUSerScript = (script: BaseScript) => {

    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.NEW_USER_SCRIPT,
            payload: script,
        });
    };
};

export const removeUserScript = (script: BaseScript) => {

    return async (dispatch: Dispatch<ScriptAction>) => {
        dispatch({
            type: ActionType.REMOVE_USER_SCRIPT,
            payload: script,
        });
    };
};
