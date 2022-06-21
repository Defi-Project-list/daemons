import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import "./styles.css";
import { UsersChart } from "./users-chart";
import { Chart, registerables } from "chart.js";
import { ScriptsChart } from "./scripts-chart";
import { TransactionsChart } from "./transactions-chart";
import { TreasuryData } from "./treasury-data";
import { BannedPage } from "../error-pages/banned-page";
Chart.register(...registerables);

export function DashboardPage() {
    const banned: boolean = useSelector((state: RootState) => state.wallet.banned);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    if (banned) return <BannedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className="dashboard-page">
            <div className="page-title">Dashboard</div>

            <div className="dashboard-page__layout">
                <div className="card">
                    <div className="card__header">
                        <div className="card__title-icon card__title-icon--bank"></div>
                        <div className="card__title">Treasury</div>
                    </div>
                    <div className="card__content">
                        <TreasuryData />
                    </div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <div className="card__title-icon card__title-icon--script"></div>
                        <div className="card__title">Scripts</div>
                    </div>
                    <div className="card__content">
                        <ScriptsChart />
                    </div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <div className="card__title-icon card__title-icon--users"></div>
                        <div className="card__title">Users</div>
                    </div>
                    <div className="card__content">
                        <UsersChart />
                    </div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <div className="card__title-icon card__title-icon--transactions"></div>
                        <div className="card__title">Transactions</div>
                    </div>
                    <div className="card__content">
                        <TransactionsChart />
                    </div>
                </div>
            </div>
        </div>
    );
}
