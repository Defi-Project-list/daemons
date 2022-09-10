import React from "react";
import { Link } from "react-router-dom";
import { RootState, useAppSelector } from "../state";

export function TipIndicator(): JSX.Element {
    const balance = useAppSelector((state: RootState) => state.user.tipBalance);
    const walletConnected = useAppSelector((state: RootState) => state.user.connected);
    const showBalance = balance !== undefined && walletConnected;

    return (
        <Link className="header-indicator" to="/my-page">
            <div className="header-indicator__tip-jar-icon" />
            <div>{showBalance ? balance : "??"} DAEM</div>
        </Link>
    );
}
