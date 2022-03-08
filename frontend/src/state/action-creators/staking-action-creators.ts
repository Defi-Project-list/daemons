import { Dispatch } from 'redux';
import { ActionType } from '../action-types';
import { getAbiFor } from '../../utils/get-abi';
import { Contracts } from '../../data/contracts';
import { BigNumber, Contract } from 'ethers';
import { StakingAction } from '../actions/staking-actions';

const getTreasuryContract = async (): Promise<Contract> => {
    const ethers = require('ethers');
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const contractAddress = Contracts.Treasury;
    const contractAbi = await getAbiFor('Treasury');
    return new ethers.Contract(contractAddress, contractAbi, provider);
};

export const fetchStakingBalance = (address?: string, chainId?: string) => {

    return async (dispatch: Dispatch<StakingAction>) => {
        if (!address || !chainId) {
            console.log('Address or ChainId missing, staking balance check aborted');
            dispatch({
                type: ActionType.STAKING_BALANCE,
                balance: undefined,
            });
            return;
        }

        console.log('Checking staking balance for', address);

        const treasury = await getTreasuryContract();
        const rawBalance: BigNumber = await treasury.balanceOf(address);
        const balance = rawBalance.div(BigNumber.from(10).pow(14)).toNumber() / 10000; // let's keep 4 digits precision

        dispatch({
            type: ActionType.STAKING_BALANCE,
            balance,
        });
    };
};

export const fetchStakingClaimable = (address?: string, chainId?: string) => {

    return async (dispatch: Dispatch<StakingAction>) => {
        if (!address || !chainId) {
            console.log('Address or ChainId missing, staking claimable check aborted');
            dispatch({
                type: ActionType.STAKING_CLAIMABLE,
                balance: undefined,
            });
            return;
        }

        console.log('Checking claimable staking reward for', address);

        const treasury = await getTreasuryContract();
        const rawBalance: BigNumber = await treasury.earned(address);
        const balance = rawBalance.div(BigNumber.from(10).pow(14)).toNumber() / 10000; // let's keep 4 digits precision

        dispatch({
            type: ActionType.STAKING_CLAIMABLE,
            balance,
        });
    };
};
