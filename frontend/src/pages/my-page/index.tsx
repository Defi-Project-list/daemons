import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import { DisconnectedPage } from "../error-pages/disconnected-page";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import { UserScriptsContainer } from "./user-scripts";
import { GasTank } from "./gas-tank";
import "./styles.css";
import "../shared.css";
import { TipJar } from "./tip-jar";
import { BannedPage } from "../error-pages/banned-page";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
import { IUserProfile } from "../../data/storage-proxy/auth-proxy";

export function MyPage(): JSX.Element {
    const user: IUserProfile | undefined = useSelector((state: RootState) => state.user.userProfile);
    const supportedChain: boolean = useSelector((state: RootState) => state.user.supportedChain);

    if (!user) return <DisconnectedPage />;
    if (user.banned) return <BannedPage />;
    if (!user.whitelisted) return <NotWhitelistedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className="my-page">
            <div className="page-title">My Page</div>

            <div className="my-page__layout">
                <div className="my-page__left-panel">
                    <UserScriptsContainer />
                </div>
                <div className="my-page__right-panel">
                    <GasTank />
                    <TipJar />
                </div>
            </div>
        </div>
    );
}
