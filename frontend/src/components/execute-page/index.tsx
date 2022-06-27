import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import { BannedPage } from "../error-pages/banned-page";
import { DisconnectedPage } from "../error-pages/disconnected-page";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import { ClaimRewards } from "./claim-reward";
import { ExecutableScriptsContainer } from "./executable-scripts";
import { Staking } from "./staking";
import "./styles.css";

export function ExecutePage() {
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const banned: boolean = useSelector((state: RootState) => state.wallet.banned);
    const whitelisted: boolean = useSelector((state: RootState) => state.wallet.whitelisted);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    if (banned) return <BannedPage />;
    if (!whitelisted) return <NotWhitelistedPage />;
    if (!authenticated) return <DisconnectedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className="execute-page">
            <div className="page-title">Execute</div>

            <div className="execute-page__layout">
                <div className="execute-page__left-panel">
                    <ExecutableScriptsContainer />
                </div>
                <div className="execute-page__right-panel">
                    <ClaimRewards />
                    <Staking />
                </div>
            </div>
        </div>
    );
}
