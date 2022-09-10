import { bigNumberToFloat, InfoFetcherABI } from "@daemons-fi/contracts/build";
import { Contract, ethers } from "ethers";
import { Dispatch } from "redux";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { StorageProxy } from "../../data/storage-proxy";
import { ActionType } from "../action-types";
import { UserAction } from "../actions/user-actions";

const getInfoFetcherContract = async (chainId: string): Promise<Contract> => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const InfoFetcherAddress = GetCurrentChain(chainId).contracts.InfoFetcher;

    return new ethers.Contract(InfoFetcherAddress, InfoFetcherABI, provider);
};

export const updateWalletAddress = (
    connected: boolean,
    supportedChain: boolean,
    address?: string,
    chainId?: string
) => {
    return (dispatch: Dispatch<UserAction>) => {
        dispatch({
            type: ActionType.WALLET_UPDATE,
            connected,
            address,
            chainId,
            supportedChain
        });
    };
};

export const authenticationCheck = (address?: string, chainId?: string) => {
    return async (dispatch: Dispatch<UserAction>) => {
        const userProfile =
            address && chainId
                ? await StorageProxy.auth.checkAuthentication(address, chainId)
                : undefined;
        dispatch({
            type: ActionType.FETCH_USER,
            userProfile: userProfile
        });
    };
};

export const clearUnseenTransactions = () => {
    return async (dispatch: Dispatch<UserAction>) => {
        dispatch({
            type: ActionType.SET_TX_AS_SEEN
        });
    };
};

export const updateUsername = (newUsername: string) => {
    return async (dispatch: Dispatch<UserAction>) => {
        dispatch({
            type: ActionType.UPDATE_USERNAME,
            username: newUsername
        });
    };
};

export const updateTutorialTooltip = (value: boolean) => {
    return async (dispatch: Dispatch<UserAction>) => {
        dispatch({
            type: ActionType.UPDATE_TUTORIAL_TOOLTIP,
            value
        });
    };
};

export const updateUserStats = (address?: string, chainId?: string) => {
    return async (dispatch: Dispatch<UserAction>) => {
        if (!address || !chainId) {
            console.debug("Address or ChainId missing, user stats check aborted");
            dispatch({
                type: ActionType.UPDATE_USER_STATS
            });
            return;
        }

        console.debug("Checking user stats for", address);

        const infoFetcher = await getInfoFetcherContract(chainId);
        const userStats = await infoFetcher.fetchUserStateOnDaemons(
            address,
            GetCurrentChain(chainId).contracts.Treasury,
            GetCurrentChain(chainId).contracts.GasTank
        );

        dispatch({
            type: ActionType.UPDATE_USER_STATS,
            gasBalance: bigNumberToFloat(userStats.ethInGasTank),
            tipBalance: bigNumberToFloat(userStats.daemInGasTank),
            gasTankClaimable: bigNumberToFloat(userStats.claimableDAEM),
            treasuryClaimable: bigNumberToFloat(userStats.claimableETH),
            treasuryStaked: bigNumberToFloat(userStats.daemInTreasury)
        });
    };
};
