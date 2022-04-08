import { Token } from '../../data/chains-data/interfaces';
import { ActionType } from "../action-types/index";

export interface IFetchTokensAction {
    type: ActionType.FETCH_TOKENS;
    payload: Token[];
}

export type TokenAction = IFetchTokensAction;
