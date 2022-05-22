import { BigNumber, Contract } from "ethers";
import { Dispatch } from 'redux';import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
 import { StorageProxy } from '../../data/storage-proxy';
 import { ERC20Abi } from "@daemons-fi/abis";
import { ActionType } from '../action-types';
import { WalletAction } from '../actions/wallet-actions';

const getDAEMContract = async (chainId: string): Promise<Contract> => {
    const ethers = require('ethers');
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const DAEMAddress = GetCurrentChain(chainId).contracts.DAEMToken;

    return new ethers.Contract(DAEMAddress, ERC20Abi, provider);
};

export const updateWalletAddress = (
    connected: boolean,
    supportedChain: boolean,
    address?: string,
    chainId?: string) => {

    return (dispatch: Dispatch<WalletAction>) => {
        dispatch({
            type: ActionType.WALLET_UPDATE,
            connected,
            address,
            chainId,
            supportedChain,
        });
    };
};

export const authenticationCheck = (address?: string) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        dispatch({
            type: ActionType.AUTH_CHECK,
            // if no address is provided, we don't even bother asking the server
            authenticated: !!address && await StorageProxy.auth.checkAuthentication(address),
        });
    };
};

export const fetchDaemBalance = (address?: string, chainId?: string) => {

    return async (dispatch: Dispatch<WalletAction>) => {
        if (!address || !chainId) {
            console.log('Address or ChainId missing, DAEM balance check aborted');
            dispatch({
                type: ActionType.FETCH_DAEM_BALANCE,
                balance: 0,
            });
            return;
        }

        console.log('Checking DAEM balance for', address);

        const DAEM = await getDAEMContract(chainId);
        const rawBalance: BigNumber = await DAEM.balanceOf(address);
        const balance = Math.floor(rawBalance.div(BigNumber.from(10).pow(14)).toNumber()) / 10000; // let's keep 4 digits precision

        dispatch({
            type: ActionType.FETCH_DAEM_BALANCE,
            balance,
        });
    };
}
