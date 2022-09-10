import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { ActionType } from "../action-types/index";
import { UserAction } from "../actions/user-actions";

export type UserState = {
    connected: boolean;
    address?: string;
    chainId?: string;
    userProfile?: IUserProfile;
    supportedChain: boolean;
    DAEMBalance: number;
    ETHBalance: number;
    gasBalance?: number;
    tipBalance?: number;
    gasTankClaimable?: number;
    treasuryStaked?: number;
    treasuryClaimable?: number;
};

const initialState: UserState = {
    connected: false,
    supportedChain: false,
    DAEMBalance: 0,
    ETHBalance: 0
};

export const userReducer = (state: UserState = initialState, action: UserAction): UserState => {
    switch (action.type) {
        case ActionType.WALLET_UPDATE:
            return {
                ...state,
                connected: action.connected,
                address: action.address,
                chainId: action.chainId,
                supportedChain: action.supportedChain
            };
        case ActionType.FETCH_USER:
            return {
                ...state,
                userProfile: action.userProfile
            };
        case ActionType.SET_TX_AS_SEEN:
            if (!state.userProfile) return { ...state };
            return {
                ...state,
                userProfile: { ...state.userProfile, unseenTransactions: 0 }
            };
        case ActionType.UPDATE_USERNAME:
            if (!state.userProfile) return { ...state };
            return {
                ...state,
                userProfile: { ...state.userProfile, username: action.username }
            };
        case ActionType.UPDATE_TUTORIAL_TOOLTIP:
            if (!state.userProfile) return { ...state };
            return {
                ...state,
                userProfile: { ...state.userProfile, showTutorial: action.value }
            };
        case ActionType.UPDATE_USER_STATS:
            return {
                ...state,
                gasBalance: action.gasBalance,
                tipBalance: action.tipBalance,
                gasTankClaimable: action.gasTankClaimable,
                treasuryStaked: action.treasuryStaked,
                treasuryClaimable: action.treasuryClaimable
            };
        default:
            return state;
    }
};
