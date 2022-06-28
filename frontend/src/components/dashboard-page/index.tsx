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
import { Card } from "../card-component/card";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
Chart.register(...registerables);

export function DashboardPage() {
    const banned: boolean = useSelector((state: RootState) => state.wallet.banned);
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const whitelisted: boolean = useSelector((state: RootState) => state.wallet.whitelisted);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    if (banned) return <BannedPage />;
    if (authenticated && !whitelisted) return <NotWhitelistedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className="dashboard-page">
            <div className="page-title">Dashboard</div>

            <div className="dashboard-page__layout">
                <Card title="Treasury" iconClass="card__title-icon--bank">
                    <TreasuryData />
                </Card>

                <Card title="Active Scripts" iconClass="card__title-icon--script">
                    <ScriptsChart />
                </Card>

                <Card title="Users with active scripts" iconClass="card__title-icon--users">
                    <UsersChart />
                </Card>

                <Card title="Transactions" iconClass="card__title-icon--transactions">
                    <TransactionsChart />
                </Card>
            </div>
        </div>
    );
}
