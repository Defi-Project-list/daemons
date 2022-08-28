import React from "react";
import { Link } from "react-router-dom";
import { GetCurrentChain } from "../data/chain-info";
import { RootState, useAppSelector } from "../state";

export function GasIndicator(): JSX.Element {
    const balance = useAppSelector((state: RootState) => state.gasTank.balance);
    const walletConnected = useAppSelector((state: RootState) => state.user.connected);
    const chainId = useAppSelector((state: RootState) => state.user.chainId);

    const showBalance = balance !== undefined && walletConnected;
    const currencySymbol = GetCurrentChain(chainId!).coinSymbol;

    return (
        <Link className="header-indicator" to="/my-page">
            <div className="header-indicator__gas-tank-icon" />
            <div>{showBalance ? balance : "??"} {currencySymbol}</div>
        </Link>
    );
}
