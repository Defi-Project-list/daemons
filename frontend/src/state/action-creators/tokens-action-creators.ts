import { Dispatch } from 'redux';
import { StorageProxy } from '../../data/storage-proxy';
import { ActionType } from '../action-types';
import { TokenAction } from '../actions/tokens-actions';


export const fetchChainTokens = (chainId?: string) => {

    return async (dispatch: Dispatch<TokenAction>) => {
        dispatch({
            type: ActionType.FETCH_TOKENS,
            payload: await StorageProxy.fetchTokens(chainId),
        });
    };
};
