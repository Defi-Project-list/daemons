import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { GetCurrentChain } from "../data/chain-info";
import { RootState } from "../state";

export function GasIndicator(): JSX.Element {
    const balance = useSelector((state: RootState) => state.gasTank.balance);
    const walletConnected = useSelector((state: RootState) => state.user.connected);
    const chainId = useSelector((state: RootState) => state.user.chainId);

    const showBalance = balance !== undefined && walletConnected;
    const currencySymbol = GetCurrentChain(chainId!).coinSymbol;

    return (
        <Link className="header-indicator" to="/my-page">
            <div className="header-indicator__gas-tank-icon" />
            <div>{showBalance ? balance : "??"} {currencySymbol}</div>
        </Link>
    );
}
