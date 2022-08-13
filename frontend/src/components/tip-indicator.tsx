import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../state";

export function TipIndicator(): JSX.Element {
    const balance = useSelector((state: RootState) => state.tipJar.balance);
    const walletConnected = useSelector((state: RootState) => state.user.connected);
    const showBalance = balance !== undefined && walletConnected;

    return (
        <Link className="header-indicator" to="/my-page">
            <div className="header-indicator__tip-jar-icon" />
            <div>{showBalance ? balance : "??"} DAEM</div>
        </Link>
    );
}
