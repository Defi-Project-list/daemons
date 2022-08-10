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
import { Card } from "../../components/card/card";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
import { IUser } from "../../data/storage-proxy/auth-proxy";
Chart.register(...registerables);

export function DashboardPage() {
    const user: IUser | undefined = useSelector((state: RootState) => state.wallet.user);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    if (user && !user.whitelisted) return <NotWhitelistedPage />;
    if (user && user.banned) return <BannedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className="dashboard-page">
            <div className="page-title">Dashboard</div>

            <div className="dashboard-page__layout">
                <Card
                    title="Treasury"
                    iconClass="card__title-icon--bank"
                    tooltipContent={
                        <div>Statistics relative to staking interest rates and the treasury</div>
                    }
                >
                    <TreasuryData />
                </Card>

                <Card
                    title="Active Scripts"
                    iconClass="card__title-icon--script"
                    tooltipContent={
                        <div>The number of scripts currently managed on this chain</div>
                    }
                >
                    <ScriptsChart />
                </Card>

                <Card
                    title="Users with active scripts"
                    iconClass="card__title-icon--users"
                    tooltipContent={
                        <div>The number of users that have active scripts on this chain</div>
                    }
                >
                    <UsersChart />
                </Card>

                <Card
                    title="Transactions"
                    iconClass="card__title-icon--transactions"
                    tooltipContent={<div>The number of daily script executions on this chain</div>}
                >
                    <TransactionsChart />
                </Card>
            </div>
        </div>
    );
}
