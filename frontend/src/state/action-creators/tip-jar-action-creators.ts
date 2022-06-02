import { Dispatch } from 'redux';
import { ActionType } from '../action-types';
import { gasTankABI } from "@daemons-fi/abis";
import { GasTankAction } from '../actions/gas-tank-actions';
import { BigNumber, Contract } from 'ethers';
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { TipJarAction } from "../actions/tip-jar-actions";

const getGasTankContract = async (chainId: string): Promise<Contract> => {
    const ethers = require('ethers');
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const contractAddress = GetCurrentChain(chainId).contracts.GasTank;

    return new ethers.Contract(contractAddress, gasTankABI, provider);
};

export const fetchTipJarBalance = (address?: string, chainId?: string) => {

    return async (dispatch: Dispatch<TipJarAction>) => {
        if (!address || !chainId) {
            console.log('Address or chainId missing, balance check aborted');
            dispatch({
                type: ActionType.TIP_JAR_BALANCE,
                balance: undefined,
            });
            return;
        }

        console.log('Checking balance in tip jar for', address);

        const gasTank = await getGasTankContract(chainId);
        const rawBalance: BigNumber = await gasTank.tipBalanceOf(address);
        const balance = rawBalance.div(BigNumber.from(10).pow(14)).toNumber() / 10000; // let's keep 4 digits precision

        dispatch({
            type: ActionType.TIP_JAR_BALANCE,
            balance,
        });
    };
};