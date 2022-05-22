import React, { ReactNode, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gasTankABI } from "@daemons-fi/abis";
import { RootState } from "../../state";
import { fetchGasTankBalance } from "../../state/action-creators/gas-tank-action-creators";
import { Field, Form } from "react-final-form";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { promiseToast } from "../toaster";
import "./gas-tank.css";
import "../switch.css";

export function GasTank(): JSX.Element {
    const dispatch = useDispatch();
    const balance = useSelector((state: RootState) => state.gasTank.balance);
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const [toggleDeposit, setToggleDeposit] = useState<boolean>(true);
    const currencySymbol = GetCurrentChain(chainId!).coinSymbol;

    const getGasTankContract = async () => {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        if (!IsChainSupported(chainId!)) throw new Error(`Chain ${chainId} is not supported!`);
        const contractAddress = GetCurrentChain(chainId!).contracts.GasTank;

        const gasTank = new ethers.Contract(contractAddress, gasTankABI, signer);
        return gasTank;
    };

    const deposit = async () => {
        const amount = parseFloat((document.getElementById("id-amount") as HTMLInputElement).value);

        const ethers = require("ethers");
        const gasTank = await getGasTankContract();

        const tx = await gasTank.deposit({ value: ethers.utils.parseEther(amount.toString()) });

        const toastedTransaction = promiseToast(
            tx.wait,
            `Depositing into the gas tank`,
            "Deposit successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchGasTankBalance(walletAddress, chainId));
    };

    const withdraw = async () => {
        const amount = parseFloat((document.getElementById("id-amount") as HTMLInputElement).value);

        const ethers = require("ethers");
        const gasTank = await getGasTankContract();

        const tx = await gasTank.withdraw(ethers.utils.parseEther(amount.toString()));

        const toastedTransaction = promiseToast(
            tx.wait,
            `Withdrawing from the gas tank`,
            "Withdrawal successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchGasTankBalance(walletAddress, chainId));
    };

    const withdrawAll = async () => {
        const gasTank = await getGasTankContract();

        const tx = await gasTank.withdrawAll();

        const toastedTransaction = promiseToast(
            tx.wait,
            `Withdrawing from the gas tank`,
            "Withdrawal successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await toastedTransaction;

        dispatch(fetchGasTankBalance(walletAddress, chainId));
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

    const renderLoadingMessage: () => ReactNode = () => {
        return <div className="gas-tank__loading">Loading...</div>;
    };

    const renderDepositForm: () => ReactNode = () => {
        return (
            <Form
                className="gas-tank__form"
                onSubmit={deposit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            className="gas-tank__input"
                            id="id-amount"
                            name="amount"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div className="gas-tank__buttons-container">
                            <input
                                disabled={buttonDisabled()}
                                className="gas-tank__button"
                                type="submit"
                                value="Deposit"
                            />
                        </div>
                    </form>
                )}
            />
        );
    };

    const renderWithdrawForm: () => ReactNode = () => {
        return (
            <Form
                className="gas-tank__form"
                onSubmit={() => {
                    /* Handled in the buttons */
                }}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            className="gas-tank__input"
                            id="id-amount"
                            name="amount"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div className="gas-tank__buttons-container">
                            <input
                                className="gas-tank__button"
                                type="submit"
                                disabled={buttonDisabled()}
                                onClick={withdraw}
                                value="Withdraw"
                            />
                            <input
                                className="gas-tank__button"
                                type="submit"
                                onClick={withdrawAll}
                                value="Withdraw All"
                            />
                        </div>
                    </form>
                )}
            />
        );
    };

    return (
        <div className="card gas-tank">
            <div className="card__header">
                <div className="card__title">Gas Tank</div>

                {/* Deposit/Withdraw switch */}
                <div className="gas-tank__switch">
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
                <div className="gas-tank__balance">
                    {balance !== undefined ? balance : "??"} {currencySymbol}
                </div>
                <div className="gas-tank__forms-container">
                    {balance === undefined || walletAddress === undefined ? (
                        renderLoadingMessage()
                    ) : (
                        <div>{toggleDeposit ? renderDepositForm() : renderWithdrawForm()}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
