import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state";
import { DisconnectedPage } from "../error-pages/disconnected-page";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import { BannedPage } from "../error-pages/banned-page";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
import { Card } from "../../components/card/card";
import { TransactionsPanel } from "./transactions-panel";
import "./styles.css";
import "../shared.css";
import { TransactionProxy } from "../../data/storage-proxy/transaction-proxy";
import { clearUnseenTransactions } from "../../state/action-creators/wallet-action-creators";
import { IUser } from "../../data/storage-proxy/auth-proxy";

export function TransactionsPage(): JSX.Element {
    const dispatch = useDispatch();
    const user: IUser | undefined = useSelector((state: RootState) => state.wallet.user);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    if (!user) return <DisconnectedPage />;
    if (user.banned) return <BannedPage />;
    if (!user.whitelisted) return <NotWhitelistedPage />;
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
                            isBeneficiary={true}
                            fetchTransactions={async (chainId?: string, page?: number) => {
                                const txs = await TransactionProxy.fetchUserTransactions(chainId, page);
                                dispatch(clearUnseenTransactions());
                                return txs;
                            }}
                        />
                    </Card>
                </div>
                <div className="transaction-page__right-panel">
                    <Card
                        title="Transactions as executor"
                        iconClass="card__title-icon--transactions"
                    >
                        <TransactionsPanel
                            isBeneficiary={false}
                            fetchTransactions={TransactionProxy.fetchExecutedTransactions}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}
