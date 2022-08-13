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
            const userWithSeenTxs = { ...state.userProfile, unseenTransactions: 0 };
            return {
                ...state,
                userProfile: userWithSeenTxs
            };
        case ActionType.UPDATE_USERNAME:
            if (!state.userProfile) return { ...state };
            const userWithNewUsername = { ...state.userProfile, username: action.username };
            return {
                ...state,
                userProfile: userWithNewUsername
            };
        default:
            return state;
    }
};
