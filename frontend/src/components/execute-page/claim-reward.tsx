import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Contracts } from '../../data/contracts';
import { RootState } from '../../state';
import { fetchGasTankClaimable } from '../../state/action-creators/gas-tank-action-creators';
import { getAbiFor } from '../../utils/get-abi';
import './claim-reward.css';


export function ClaimRewards() {
    const dispatch = useDispatch();
    const claimable = useSelector((state: RootState) => state.gasTank.claimable);
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const nothingToClaim = !claimable;

    const claim = async () => {
        if (nothingToClaim) return;
        const gasTank = await getGasTankContract();
        const tx = await gasTank.claimReward();
        await tx.wait();

        dispatch(fetchGasTankClaimable(walletAddress));
    };

    const claimAndStake = async () => {
        if (nothingToClaim) return;
        alert('Not implemented yet');
        dispatch(fetchGasTankClaimable(walletAddress));
    };

    const getGasTankContract = async () => {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = Contracts.GasTank;
        const contractAbi = await getAbiFor('GasTank');
        const gasTank = new ethers.Contract(contractAddress, contractAbi, signer);
        return gasTank;
    };

    return (
        <div className='card'>
            <div className='card__title'>Claim DAEM</div>
            <div className="claim-reward">
                <div className="claim-reward__claimable">
                    {
                        nothingToClaim
                            ? `Nothing to claim`
                            : `${claimable} DAEM to be claimed`
                    }
                </div>

                <div className='claim-reward__buttons-container'>
                    <button
                        disabled={nothingToClaim}
                        className='claim-reward__button'
                        onClick={() => { claim(); }} >
                        Claim
                    </button>
                    <button
                        disabled={nothingToClaim}
                        className='claim-reward__button'
                        onClick={() => { claimAndStake(); }} >
                        Claim &#38; Stake
                    </button>
                </div>
            </div>
        </div>
    );
}