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
import { getAbiFor } from "../../utils/get-abi";
import { errorToast, promiseToast } from "../toaster";
import "./staking.css";

export function Staking() {
    const dispatch = useDispatch();
    const balance = useSelector((state: RootState) => state.staking.balance);
    const claimable = useSelector((state: RootState) => state.staking.claimable);
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const DAEMBalance = useSelector((state: RootState) => state.wallet.DAEMBalance);
    const [toggleDeposit, setToggleDeposit] = useState<boolean>(true);
    const [needsAllowance, setNeedsAllowance] = useState<boolean>(true);
    const contracts = GetCurrentChain(chainId!).contracts;

    // wallet signer and provider
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();


    const checkForAllowance = async () => {
        const hasAllowance = await AllowanceHelper.checkForERC20Allowance(
            walletAddress!,
            contracts.DAEMToken,
            contracts.Treasury,
            ethers.utils.parseEther("100000"),
            signer
        );
        console.log("hasAllowance", hasAllowance);
        setNeedsAllowance(!hasAllowance);
    };

    useEffect(() => {
        dispatch(fetchStakingBalance(walletAddress, chainId));
        dispatch(fetchStakingClaimable(walletAddress, chainId));
        dispatch(fetchDaemBalance(walletAddress, chainId));
        checkForAllowance();
    }, []);

    const exit = async () => {
        if (!claimable && !balance) {
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
            contracts.DAEMToken,
            contracts.Treasury,
            signer
        );
        const toastedTransaction = promiseToast(
            tx.wait,
            `Granting the allowance to the treasury...`,
            "Allowance successfully granted 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;
        await checkForAllowance();
    };

    const stake = async () => {
        const amount = parseFloat((document.getElementById("id-amount") as HTMLInputElement).value);

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
        (document.getElementById("id-amount") as HTMLInputElement).value = "";
    };

    const withdraw = async () => {
        const amount = parseFloat((document.getElementById("id-amount") as HTMLInputElement).value);

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
        (document.getElementById("id-amount") as HTMLInputElement).value = "";
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
        const contractAbi = await getAbiFor("Treasury");
        const treasury = new ethers.Contract(contractAddress, contractAbi, signer);
        return treasury;
    };

    const buttonDisabled = () => {
        const amountInput = document.getElementById("id-amount") as HTMLInputElement | undefined;
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
                className="staking__form"
                onSubmit={() => {
                    /* Handled in the buttons */
                }}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            className="staking__input"
                            id="id-amount"
                            name="amount"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div
                            className="staking__max-balance-button"
                            onClick={() =>
                                ((document.getElementById("id-amount") as HTMLInputElement).value =
                                    DAEMBalance.toString())
                            }
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
                className="staking__form"
                onSubmit={() => {
                    /* Handled in the buttons */
                }}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            className="staking__input"
                            id="id-amount"
                            name="amount"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div className="staking__buttons-container">
                            <input
                                disabled={!balance || buttonDisabled()}
                                className="staking__button"
                                type="submit"
                                onClick={withdraw}
                                value="Unstake"
                            />
                            <input
                                disabled={!balance}
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

    return (
        <div className="card staking">
            <div className="card__header">
                <div className="card__title">Stake</div>

                {/* Deposit/Withdraw switch */}
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
            </div>

            <div>
                <div className="staking__balance">
                    {balance !== undefined ? balance : "??"} DAEM
                </div>
                <div className="staking__forms-container">
                    {balance === undefined || walletAddress === undefined ? (
                        renderLoadingMessage()
                    ) : (
                        <div>{toggleDeposit ? renderDepositForm() : renderWithdrawForm()}</div>
                    )}
                </div>
            </div>
            <div className="staking__reward-info">
                <div className="staking__claimable">
                    {claimable !== undefined ? `Claimable: ${claimable} ETH` : "??"}
                </div>
                <input
                    disabled={!claimable}
                    className="staking__button staking__button--small"
                    type="submit"
                    onClick={claim}
                    value="Claim"
                />
            </div>
        </div>
    );
}
