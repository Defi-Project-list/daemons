import { bigNumberToFloat } from "@daemons-fi/contracts/build";
import { BaseScript, getGasLimitForScript } from "@daemons-fi/scripts-definitions/build";
import React from "react";
import { Link } from "react-router-dom";
import { GetCurrentChain } from "../data/chain-info";
import { RootState, useAppSelector } from "../state";
import { Tooltip } from "./tooltip";

export function GasIndicator(): JSX.Element {
    const balance = useAppSelector((state: RootState) => state.user.gasBalance);
    const walletConnected = useAppSelector((state: RootState) => state.user.connected);
    const chainId = useAppSelector((state: RootState) => state.user.chainId);
    const userScripts = useAppSelector((state: RootState) => state.script.userScripts);
    const currentGasPrice = useAppSelector((state: RootState) => state.gasPriceFeed.price) ?? 0;

    const showBalance = balance !== undefined && walletConnected;
    const currencySymbol = GetCurrentChain(chainId!).coinSymbol;

    const getScriptCost = (script: BaseScript) =>
        getGasLimitForScript(script.ScriptType).mul(currentGasPrice);
    const maxGas = !userScripts.length
        ? 0
        : Math.max(...userScripts.map((s) => bigNumberToFloat(getScriptCost(s), 5)));
    const isGasTankLow = balance !== undefined && currentGasPrice > 0 && balance < maxGas * 10;
    const isGasTankEmpty = balance !== undefined && currentGasPrice > 0 && balance < maxGas;

    const gasTankIndicatorIcon = () => (
        <div
            className={`header-indicator__gas-tank-icon ${
                isGasTankEmpty
                    ? "header-indicator__gas-tank-icon--empty"
                    : isGasTankLow
                    ? "header-indicator__gas-tank-icon--low"
                    : ""
            }`}
        />
    );

    return (
        <Link className="header-indicator" to="/my-page">
            {isGasTankEmpty ? (
                // If Gas tank is empty we render the icon with a tooltip message
                <Tooltip iconComponent={gasTankIndicatorIcon()}>
                    GAS TANK EMPTY
                    <br />
                    <br />
                    Some of your scripts cannot be executed as you don't have enough gas.
                    <br />
                    <br />
                    Fill the gas tank if you want your scripts to be executed (at least to {maxGas}
                    {currencySymbol}).
                </Tooltip>
            ) : isGasTankLow ? (
                // If Gas tank is low we render the icon with a tooltip message
                <Tooltip iconComponent={gasTankIndicatorIcon()}>
                    LOW GAS
                    <br />
                    <br />
                    You will soon run out of gas. We advise to leave enough gas to execute at least
                    10 scripts ({maxGas * 10}
                    {currencySymbol}).
                </Tooltip>
            ) : (
                // Otherwise we just render the icon
                gasTankIndicatorIcon()
            )}
            <div>
                {showBalance ? balance : "??"} {currencySymbol}
            </div>
        </Link>
    );
}
