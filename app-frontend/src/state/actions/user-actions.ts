import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { ActionType } from "../action-types/index";

export interface IUpdateWalletAction {
    type: ActionType.WALLET_UPDATE;
    connected: boolean;
    address?: string;
    chainId?: string;
    supportedChain: boolean;
}

export interface IAuthCheck {
    type: ActionType.FETCH_USER;
    userProfile?: IUserProfile;
}

export interface ISetTxAsSeen {
    type: ActionType.SET_TX_AS_SEEN;
}

export interface IUpdateUsername {
    type: ActionType.UPDATE_USERNAME;
    username: string;
}

export interface IUpdateTutorialTooltip {
    type: ActionType.UPDATE_TUTORIAL_TOOLTIP;
    value: boolean;
}

export interface IUpdateUserStats {
    type: ActionType.UPDATE_USER_STATS;
    gasBalance?: number;
    tipBalance?: number;
    gasTankClaimable?: number;
    treasuryStaked?: number;
    treasuryClaimable?: number;
}

export type UserAction =
    | IUpdateWalletAction
    | IAuthCheck
    | ISetTxAsSeen
    | IUpdateUsername
    | IUpdateTutorialTooltip
    | IUpdateUserStats;
