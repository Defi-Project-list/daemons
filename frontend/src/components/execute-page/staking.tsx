import React, { useState } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { Contracts } from '../../data/contracts';
import { RootState } from '../../state';
import { getAbiFor } from '../../utils/get-abi';
import './staking.css';


export function Staking() {
    const dispatch = useDispatch();
    const claimable = 0.12345;// useSelector((state: RootState) => state.gasTank.claimable);
    const balance = 0.98765;
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const [toggleDeposit, setToggleDeposit] = useState<boolean>(true);
    const nothingToClaim = !claimable;
    const nothingDeposited = !balance;

    const exit = async () => {
        if (nothingToClaim && nothingDeposited) return;
        const treasury = await getTreasuryContract();
        const tx = await treasury.exit();
        await tx.wait();

        //dispatch(fetchGasTankClaimable(walletAddress));
    };

    const deposit = async () => {

    };

    const withdraw = async () => {

    };

    const claim = async () => {
        if (nothingToClaim) return;
        const treasury = await getTreasuryContract();
        const tx = await treasury.getReward();
        await tx.wait();

        //dispatch(fetchGasTankClaimable(walletAddress));
    };

    const getTreasuryContract = async () => {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = Contracts.Treasury;
        const contractAbi = await getAbiFor('Treasury');
        const treasury = new ethers.Contract(contractAddress, contractAbi, signer);
        return treasury;
    };

    const renderLoadingMessage: () => JSX.Element = () => {
        return (
            <div className='staking__loading'>
                Loading...
            </div>
        );
    };

    const renderDepositForm: () => JSX.Element = () => {
        return (
            <Form
                className='staking__form'
                onSubmit={deposit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            className='staking__input'
                            id='id-amount'
                            name="amount"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div className='staking__buttons-container'>
                            <input className='staking__button' type="submit" value="Deposit" />
                        </div>
                    </form>
                )}
            />
        );
    };

    const renderWithdrawForm: () => JSX.Element = () => {
        return (
            <Form
                className='staking__form'
                onSubmit={() => {/* Handled in the buttons */ }}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            className='staking__input'
                            id='id-amount'
                            name="amount"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div className='staking__buttons-container'>
                            <input className='staking__button' type="submit" onClick={withdraw} value="Withdraw" />
                            <input className='staking__button' type="submit" onClick={exit} value="Withdraw All" />
                        </div>
                    </form>
                )}
            />
        );
    };

    return (
        <div className='card staking'>
            <div className='card__header'>
                <div className='card__title'>Stake</div>

                {/* Deposit/Withdraw switch */}
                <div className='staking__switch'>
                    Deposit
                    <label className="switch">
                        <input
                            type="checkbox"
                            value={String(toggleDeposit)}
                            onChange={() => setToggleDeposit(!toggleDeposit)}
                        />
                        <span className="slider round"></span>
                    </label>
                    Withdraw
                </div>
            </div>

            <div>
                <div className="staking__balance">{balance !== undefined ? balance : '??'} DAEM</div>
                <div className="staking__forms-container">
                    {
                        balance === undefined || walletAddress === undefined
                            ? renderLoadingMessage()
                            : (
                                <div>
                                    {
                                        toggleDeposit
                                            ? renderDepositForm()
                                            : renderWithdrawForm()
                                    }
                                </div>
                            )
                    }
                </div>
            </div>
            <div className='staking__reward-info'>
                <div className="staking__claimable">
                    {
                        claimable !== undefined
                            ? `Claimable: ${claimable} ETH`
                            : '??'
                    }
                </div>
                <input className='staking__button staking__button--small' type="submit" onClick={claim} value="Claim" />
            </div>
        </div>
    );
}
