import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import { DisconnectedPage } from "../error-pages/disconnected-page";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import { BannedPage } from "../error-pages/banned-page";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
import { Card } from "../card-component/card";
import { TransactionsPanel } from "./transactions-panel";
import "./styles.css";
import "../shared.css";
import { TransactionProxy } from "../../data/storage-proxy/transaction-proxy";

export function TransactionsPage(): JSX.Element {
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const banned: boolean = useSelector((state: RootState) => state.wallet.banned);
    const whitelisted: boolean = useSelector((state: RootState) => state.wallet.whitelisted);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    if (banned) return <BannedPage />;
    if (!whitelisted) return <NotWhitelistedPage />;
    if (!authenticated) return <DisconnectedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className="transactions-page">
            <div className="page-title">Transactions</div>

            <div className="transaction-page__layout">
                <div className="transaction-page__left-panel">
                    <Card
                        title="Transactions as beneficiary"
                        iconClass="card__title-icon--transactions"
                    >
                        <TransactionsPanel
                            fetchTransactions={TransactionProxy.fetchUserTransactions}
                        />
                    </Card>
                </div>
                <div className="transaction-page__right-panel">
                    <Card
                        title="Transactions as executor"
                        iconClass="card__title-icon--transactions"
                    >
                        <TransactionsPanel
                            fetchTransactions={TransactionProxy.fetchExecutedTransactions}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}
