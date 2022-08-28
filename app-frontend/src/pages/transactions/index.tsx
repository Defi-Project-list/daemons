import React from "react";
import { RootState, useAppDispatch, useAppSelector } from "../../state";
import { DisconnectedPage } from "../error-pages/disconnected-page";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import { BannedPage } from "../error-pages/banned-page";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
import { Card } from "../../components/card/card";
import { TransactionsPanel } from "./transactions-panel";
import "./styles.css";
import "../shared.css";
import { TransactionProxy } from "../../data/storage-proxy/transaction-proxy";
import { clearUnseenTransactions } from "../../state/action-creators/user-action-creators";
import { IUserProfile } from "../../data/storage-proxy/auth-proxy";

export function TransactionsPage(): JSX.Element {
    const dispatch = useAppDispatch();
    const user: IUserProfile | undefined = useAppSelector(
        (state: RootState) => state.user.userProfile
    );
    const supportedChain: boolean = useAppSelector((state: RootState) => state.user.supportedChain);

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
                        tooltipContent={
                            <div>
                                Each time someone will execute one of your scripts, the transaction
                                will appear here.
                                <br />
                                <br />
                                The "Cost" column shows how much was withdrawn from your GasTank to
                                pay for the execution.
                            </div>
                        }
                    >
                        <TransactionsPanel
                            isBeneficiary={true}
                            fetchTransactions={async (chainId?: string, page?: number) => {
                                const txs = await TransactionProxy.fetchUserTransactions(
                                    chainId,
                                    page
                                );
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
                        tooltipContent={
                            <div>
                                Each time you will execute someone else's script, the transaction
                                will appear here.
                                <br />
                                <br />
                                The "Profit" column shows how much you were rewarded for the
                                execution.
                            </div>
                        }
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
