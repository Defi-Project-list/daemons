import React from "react";
import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { RootState, useAppSelector } from "../../state";
import { BannedPage } from "../error-pages/banned-page";
import { DisconnectedPage } from "../error-pages/disconnected-page";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import { ClaimRewards } from "./claim-reward";
import { ExecutableScriptsContainer } from "./executable-scripts";
import { Staking } from "./staking";
import "./styles.css";

export function ExecutePage() {
    const user: IUserProfile | undefined = useAppSelector(
        (state: RootState) => state.user.userProfile
    );
    const supportedChain: boolean = useAppSelector((state: RootState) => state.user.supportedChain);

    if (!user) return <DisconnectedPage />;
    if (user.banned) return <BannedPage />;
    if (!user.whitelisted) return <NotWhitelistedPage />;
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
