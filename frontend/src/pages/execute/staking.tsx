import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import { useDispatch, useSelector } from "react-redux";
import { GetCurrentChain } from "../../data/chain-info";
import { RootState } from "../../state";
import {
    fetchStakingBalance,
    fetchStakingClaimable
} from "../../state/action-creators/staking-action-creators";
import { fetchDaemBalance } from "../../state/action-creators/wallet-action-creators";
import { AllowanceHelper } from "@daemons-fi/scripts-definitions";
import { treasuryABI } from "@daemons-fi/contracts";
import { errorToast, promiseToast } from "../../components/toaster";
import "./staking.css";
import { Card, HeadlessCard } from "../../components/card/card";
import CountUp from "react-countup";
import { fetchTreasuryStats } from "../../state/action-creators/treasury-action-creators";

export function Staking() {
    const dispatch = useDispatch();
    const stakingBalance = useSelector((state: RootState) => state.staking.balance);
    const claimable = useSelector((state: RootState) => state.staking.claimable);
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const DAEMBalance = useSelector((state: RootState) => state.wallet.DAEMBalance);
    const [toggleDeposit, setToggleDeposit] = useState<boolean>(true);
    const [needsAllowance, setNeedsAllowance] = useState<boolean>(true);
    const [apy, setApy] = useState<number>(0);
    const contracts = GetCurrentChain(chainId!).contracts;
    const currencySymbol = GetCurrentChain(chainId!).coinSymbol;
    const currentDAEMPrice = useSelector((state: RootState) => state.prices.DAEMPriceInEth);
    const distrInterval = useSelector((state: RootState) => state.treasury.distrInterval);
    const redistributionPool = useSelector((state: RootState) => state.treasury.redistributionPool);
    const stakedAmount = useSelector((state: RootState) => state.treasury.stakedAmount);

    // wallet signer and provider
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();

    const checkForAllowance = async () => {
        const hasAllowance = await AllowanceHelper.checkForERC20Allowance(
            walletAddress!,
            contracts.DaemonsToken,
            contracts.Treasury,
            ethers.utils.parseEther("100000"),
            signer
        );
        setNeedsAllowance(!hasAllowance);
    };

    useEffect(() => {
        dispatch(fetchTreasuryStats(chainId));
        dispatch(fetchStakingBalance(walletAddress, chainId));
        dispatch(fetchStakingClaimable(walletAddress, chainId));
        dispatch(fetchDaemBalance(walletAddress, chainId));
        checkForAllowance();
    }, []);

    useEffect(() => {
        if (!redistributionPool || !currentDAEMPrice || !stakedAmount || !distrInterval) return;
        // 360 / distribution-in-days * treasury / staked-DAEM / ETH-worth-of-DAEM
        const secondsInOneYear = 31104000;
        const apr =
            (((secondsInOneYear / distrInterval!) * redistributionPool!) /
                stakedAmount! /
                currentDAEMPrice!) *
            100;
        const apy = (Math.pow(1 + apr / 100 / 365, 365) - 1) * 100;
        setApy(apy);
    }, [redistributionPool, stakedAmount, distrInterval, currentDAEMPrice]);

    const exit = async () => {
        if (!claimable && !stakingBalance) {
            errorToast("No balance, nor anything claimable");
            return;
        }

        const treasury = await getTreasuryContract();
        const tx = await treasury.exit();
        const toastedTransaction = promiseToast(
            tx.wait,
            `Unstaking DAEM and claiming reward...`,
            "Unstake and claim successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchStakingBalance(walletAddress, chainId));
        dispatch(fetchStakingClaimable(walletAddress, chainId));
        dispatch(fetchDaemBalance(walletAddress, chainId));
    };

    const requestAllowance = async () => {
        const tx = await AllowanceHelper.requestERC20Allowance(
            contracts.DaemonsToken,
            contracts.Treasury,
            signer
        );
        const toastedTransaction = promiseToast(
            tx.wait,
            `Granting the allowance to the treasury (this is a one-time action)...`,
            "Allowance successfully granted 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;
        await checkForAllowance();
    };

    const stake = async () => {
        const amount = parseFloat(
            (document.getElementById("id-staking-amount") as HTMLInputElement).value
        );

        const treasury = await getTreasuryContract();
        const tx = await treasury.stake(ethers.utils.parseEther(amount.toString()));
        const toastedTransaction = promiseToast(
            tx.wait,
            `Staking DAEM into treasury`,
            "Staking successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchStakingBalance(walletAddress, chainId));
        dispatch(fetchDaemBalance(walletAddress, chainId));
    };

    const withdraw = async () => {
        const amount = parseFloat(
            (document.getElementById("id-staking-amount") as HTMLInputElement).value
        );

        const treasury = await getTreasuryContract();
        const tx = await treasury.withdraw(ethers.utils.parseEther(amount.toString()));
        const toastedTransaction = promiseToast(
            tx.wait,
            `Unstaking DAEM from treasury`,
            "Unstake successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchStakingBalance(walletAddress, chainId));
        dispatch(fetchDaemBalance(walletAddress, chainId));
        (document.getElementById("id-staking-amount") as HTMLInputElement).value = "";
    };

    const claim = async () => {
        if (!claimable) {
            errorToast("Nothing to claim");
            return;
        }

        const treasury = await getTreasuryContract();
        const tx = await treasury.getReward();
        const toastedTransaction = promiseToast(
            tx.wait,
            `Claiming reward`,
            "Claim successful 🎉. Thanks for being a Daemons users! You make our day",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchStakingClaimable(walletAddress, chainId));
    };

    const getTreasuryContract = async () => {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = contracts.Treasury;
        const treasury = new ethers.Contract(contractAddress, treasuryABI, signer);
        return treasury;
    };

    const buttonDisabled = () => {
        const amountInput = document.getElementById("id-staking-amount") as
            | HTMLInputElement
            | undefined;
        return (
            !amountInput ||
            !amountInput.value ||
            isNaN(parseFloat(amountInput.value)) ||
            parseFloat(amountInput.value) <= 0
        );
    };

    const renderLoadingMessage: () => JSX.Element = () => {
        return <div className="staking__loading">Loading...</div>;
    };

    const renderDepositForm: () => JSX.Element = () => {
        return (
            <Form
                onSubmit={() => {
                    /* Handled in the buttons */
                }}
                mutators={{
                    setMaxDaemAmount: (args, state, utils) => {
                        utils.changeValue(state, "amount", () => DAEMBalance.toString());
                        // manually enable submit button
                        (
                            document.getElementById("id-staking-submit-button") as HTMLInputElement
                        ).disabled = DAEMBalance === 0;
                    }
                }}
                render={({ form, handleSubmit }) => (
                    <form className="staking__form" onSubmit={handleSubmit}>
                        <Field
                            className="card__input"
                            id="id-staking-amount"
                            name="amount"
                            autoComplete="off"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div
                            className="staking__max-balance-button"
                            onClick={form.mutators.setMaxDaemAmount}
                        >
                            Max: {DAEMBalance}
                        </div>
                        <div className="staking__buttons-container">
                            {needsAllowance ? (
                                <input
                                    className="staking__button"
                                    type="submit"
                                    onClick={requestAllowance}
                                    value="Request Allowance"
                                />
                            ) : (
                                <input
                                    disabled={buttonDisabled()}
                                    className="staking__button"
                                    id="id-staking-submit-button"
                                    type="submit"
                                    onClick={stake}
                                    value="Stake"
                                />
                            )}
                        </div>
                    </form>
                )}
            />
        );
    };

    const renderWithdrawForm: () => JSX.Element = () => {
        return (
            <Form
                onSubmit={() => {
                    /* Handled in the buttons */
                }}
                mutators={{
                    setMaxDaemAmount: (args, state, utils) => {
                        if (stakingBalance === undefined) return;
                        utils.changeValue(state, "amount", () => stakingBalance.toString());
                        // manually enable submit button
                        (
                            document.getElementById("id-staking-submit-button") as HTMLInputElement
                        ).disabled = stakingBalance === 0;
                    }
                }}
                render={({ form, handleSubmit }) => (
                    <form className="staking__form" onSubmit={handleSubmit}>
                        <Field
                            className="card__input"
                            id="id-staking-amount"
                            name="amount"
                            autoComplete="off"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div
                            className="staking__max-balance-button"
                            onClick={form.mutators.setMaxDaemAmount}
                        >
                            Max: {stakingBalance}
                        </div>
                        <div className="staking__buttons-container">
                            <input
                                disabled={!stakingBalance || buttonDisabled()}
                                className="staking__button"
                                id="id-staking-submit-button"
                                type="submit"
                                onClick={withdraw}
                                value="Unstake"
                            />
                            <input
                                disabled={!stakingBalance}
                                className="staking__button"
                                type="submit"
                                onClick={exit}
                                value="Unstake All &amp; Claim"
                            />
                        </div>
                    </form>
                )}
            />
        );
    };

    const depositWithdrawSwitch = (
        <div className="staking__switch">
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
    );

    return (
        <>
            <Card
                title="Stake"
                iconClass="card__title-icon--stake"
                actionComponent={depositWithdrawSwitch}
            >
                <div className="staking__apy-info">
                    <div>APY, paid in ETH:</div>
                    <div className="staking__apy">
                        <CountUp duration={0.5} decimals={2} suffix={`%`} end={apy ?? 0} />
                    </div>
                </div>
                <div className="card__fake-input">
                    {stakingBalance !== undefined ? stakingBalance : "??"} DAEM
                </div>
                <div className="staking__forms-container">
                    {stakingBalance === undefined || walletAddress === undefined ? (
                        renderLoadingMessage()
                    ) : (
                        <div>{toggleDeposit ? renderDepositForm() : renderWithdrawForm()}</div>
                    )}
                </div>
            </Card>

            <HeadlessCard>
                <div className=" staking__reward-info">
                    <div className="staking__claimable">
                        {claimable !== undefined
                            ? `Claimable: ${claimable} ${currencySymbol}`
                            : "??"}
                    </div>
                    <input
                        disabled={!claimable}
                        className="staking__button staking__button--small"
                        type="submit"
                        onClick={claim}
                        value="Claim"
                    />
                </div>
            </HeadlessCard>
        </>
    );
}
