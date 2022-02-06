import { Token } from '../../data/tokens';
import { ActionType } from "../action-types/index";
import { TokenAction } from '../actions/tokens-actions';

export type TokensState = {
    currentChainTokens: Token[];
};

const initialState: TokensState = {
    currentChainTokens: []
};

export const tokensReducer = (state: TokensState = initialState, action: TokenAction): TokensState => {
    switch (action.type) {
        case ActionType.FETCH_TOKENS:
            return {
                ...state,
                currentChainTokens: action.payload,
            };
        default:
            return state;
    }
};
