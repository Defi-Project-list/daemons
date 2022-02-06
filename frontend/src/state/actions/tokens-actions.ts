import { BaseScript } from '../../data/script/base-script';
import { Token } from '../../data/tokens';
import { ActionType } from "../action-types/index";

export interface IFetchTokensAction {
    type: ActionType.FETCH_TOKENS;
    payload: Token[];
}

export type TokenAction = IFetchTokensAction;
