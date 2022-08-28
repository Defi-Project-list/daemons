import { BigNumber, Contract, ethers } from "ethers";
import { Dispatch } from "redux";
import { GetCurrentChain, IsChainSupported, ZeroAddress } from "../../data/chain-info";
import { ERC20Abi, InfoFetcherABI } from "@daemons-fi/contracts";
import { ActionType } from "../action-types";
import { WalletAction } from "../actions/wallet-actions";
import { bigNumberToFloat } from "@daemons-fi/contracts";
import { IToken, MoneyMarket } from "../../data/chains-data/interfaces";
import { IMMInfo, retrieveMmInfo } from "../../data/retrieve-mm-info";

const getDAEMContract = async (chainId: string): Promise<Contract> => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const DAEMAddress = GetCurrentChain(chainId).contracts.DaemonsToken;

    return new ethers.Contract(DAEMAddress, ERC20Abi, provider);
};

const getInfoFetcherContract = async (chainId: string): Promise<Contract> => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const InfoFetcherAddress = GetCurrentChain(chainId).contracts.InfoFetcher;

    return new ethers.Contract(InfoFetcherAddress, InfoFetcherABI, provider);
};

export const fetchDaemBalance = (address?: string, chainId?: string) => {
    return async (dispatch: Dispatch<WalletAction>) => {
        if (!address || !chainId) {
            console.debug("Address or ChainId missing, DAEM balance check aborted");
            dispatch({
                type: ActionType.FETCH_DAEM_BALANCE,
                balance: 0
            });
            return;
        }

        console.debug("Checking DAEM balance for", address);

        const DAEM = await getDAEMContract(chainId);
        const rawBalance: BigNumber = await DAEM.balanceOf(address);
        const balance = bigNumberToFloat(rawBalance);

        dispatch({
            type: ActionType.FETCH_DAEM_BALANCE,
            balance
        });
    };
};

export const fetchEthBalance = (address?: string, chainId?: string) => {
    return async (dispatch: Dispatch<WalletAction>) => {
        if (!address || !chainId) {
            console.debug("Address or ChainId missing, ETH balance check aborted");
            dispatch({
                type: ActionType.FETCH_ETH_BALANCE,
                balance: 0
            });
            return;
        }

        console.debug("Checking ETH balance for", address);

        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const rawBalance: BigNumber = await provider.getBalance(address);
        const balance = bigNumberToFloat(rawBalance, 6);

        dispatch({
            type: ActionType.FETCH_ETH_BALANCE,
            balance
        });
    };
};

export const fetchTokenBalances = (address?: string, chainId?: string, force?: boolean) => {
    return async (dispatch: Dispatch<WalletAction>) => {
        if (!address || !chainId) {
            console.debug("Address or ChainId missing, token balances check aborted");
            dispatch({
                type: ActionType.FETCH_BALANCES,
                coinBalance: 0,
                tokenBalances: {}
            });
            return;
        }

        console.debug("Checking token balances for", address);

        const InfoFetcher = await getInfoFetcherContract(chainId);
        const tokensDict: { [tokenAddress: string]: IToken } = {};
        GetCurrentChain(chainId).tokens.forEach((t) => (tokensDict[t.address] = t));
        const tokenAddresses = Object.keys(tokensDict);

        const rawBalances = await InfoFetcher.fetchBalances(address, tokenAddresses);

        const coinBalance = bigNumberToFloat(rawBalances.coin, 5);
        const tokenBalances: { [tokenAddress: string]: number } = {};
        rawBalances.tokens.forEach((bn: BigNumber, i: number) => {
            const tokenAddress = tokenAddresses[i];
            const token = tokensDict[tokenAddress];
            tokenBalances[tokenAddress] = bigNumberToFloat(bn, 4, token.decimals);
        });

        dispatch({
            type: ActionType.FETCH_BALANCES,
            coinBalance,
            tokenBalances
        });
    };
};

export const fetchMmInfo = (moneyMarket: MoneyMarket, address?: string, chainId?: string) => {
    return async (dispatch: Dispatch<WalletAction>) => {
        if (!address || !chainId) {
            console.debug("Address or ChainId missing, MoneyMarket Info check aborted");
            dispatch({
                type: ActionType.FETCH_MM_INFO
            });
            return;
        }

        console.debug(`Checking MoneyMarket ${moneyMarket.name} for user ${address}`);
        const mmInfo = await retrieveMmInfo(chainId, address, moneyMarket);

        dispatch({
            type: ActionType.FETCH_MM_INFO,
            moneyMarketPool: moneyMarket.poolAddress,
            mmInfo: mmInfo
        });
    };
};

export const cleanMmInfo = () => {
    return async (dispatch: Dispatch<WalletAction>) => {
        dispatch({
            type: ActionType.CLEAN_MM_INFO
        });
    };
};
