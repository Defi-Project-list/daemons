import { Dispatch } from 'redux';
import { ActionType } from '../action-types';
import { getAbiFor } from '../../utils/get-abi';
import { Contracts } from '../../data/contracts';
import { GasTankAction } from '../actions/gas-tank-actions';
import { BigNumber } from 'ethers';

export const fetchGasTankBalance = (address: string) => {

    return async (dispatch: Dispatch<GasTankAction>) => {
        console.log('Checking balance in gas tank for', address);
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);

        const contractAddress = Contracts.GasTank;
        const contractAbi = await getAbiFor('GasTank');

        const gasTank = new ethers.Contract(contractAddress, contractAbi, provider);
        const rawBalance: BigNumber = await gasTank.balanceOf(address);
        const balance = rawBalance.div(BigNumber.from(10).pow(18)).toNumber();

        dispatch({
            type: ActionType.GAS_TANK_BALANCE,
            balance,
        });
    };
};
