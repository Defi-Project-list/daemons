import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import "./styles.css";
import { UsersChart } from "./users-chart";
import {Chart, registerables } from 'chart.js';
import { ScriptsChart } from "./scripts-chart";
Chart.register(...registerables);


export function DashboardPage() {
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className="dashboard-page">
            <div className="title">Dashboard</div>

            <div className="dashboard-page__layout">
                <div className="card">
                    <div className="card__title">Treasury</div>Getting there...
                </div>

                <div className="card">
                    <div className="card__title">Scripts</div>
                    <ScriptsChart/>
                </div>

                <div className="card">
                    <div className="card__title">Users</div>
                    <UsersChart/>
                </div>

                <div className="card">
                    <div className="card__title">Smiles And Happiness</div>Getting there...
                </div>
            </div>
        </div>
    );
}
