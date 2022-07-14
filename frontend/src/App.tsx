import React, { useEffect } from "react";
import { ConnectWalletButton } from "./components/wallet-connector";
import { MetaMaskProvider } from "metamask-react";
import { Link } from "react-router-dom";
import logo from "./assets/logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./state";
import { GasIndicator } from "./components/gas-indicator";
import { fetchUserScripts } from "./state/action-creators/script-action-creators";
import { fetchGasTankBalance } from "./state/action-creators/gas-tank-action-creators";
import { fetchGasTankClaimable } from "./state/action-creators/gas-tank-action-creators";
import { ToastContainer } from "react-toastify";
import { fetchTipJarBalance } from "./state/action-creators/tip-jar-action-creators";
import { TipIndicator } from "./components/tip-indicator";
import { fetchLatestGasPrice } from "./state/action-creators/gas-price-feed-action-creators";
import { fetchDAEMPriceInEth } from "./state/action-creators/prices-action-creators";
import { fetchDaemBalance, fetchEthBalance } from "./state/action-creators/wallet-action-creators";
import "react-toastify/dist/ReactToastify.css";
import "./fonts.css";
import "./constants.css";
import "./app.css";
import { TransactionsVerifier } from "./transactions-verifier";

export const App = ({ children }: { children: any }) => {
    // redux
    const dispatch = useDispatch();
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const walletAddress: string | undefined = useSelector(
        (state: RootState) => state.wallet.address
    );
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const whitelisted: boolean = useSelector((state: RootState) => state.wallet.whitelisted);
    const banned: boolean = useSelector((state: RootState) => state.wallet.banned);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    // menu selection classes
    const dashboardLinkClassName = `menu__entry ${
        document.location.href.endsWith("/") ? "menu__entry--selected" : "menu__entry--unselected"
    }`;
    const myPageLinkClassName = `menu__entry ${
        document.location.href.endsWith("/my-page")
            ? "menu__entry--selected"
            : "menu__entry--unselected"
    }`;
    const executeLinkClassName = `menu__entry ${
        document.location.href.endsWith("/execute")
            ? "menu__entry--selected"
            : "menu__entry--unselected"
    }`;
    const transactionsLinkClassName = `menu__entry ${
        document.location.href.endsWith("/transactions")
            ? "menu__entry--selected"
            : "menu__entry--unselected"
    }`;

    useEffect(() => {
        if (authenticated && walletAddress && supportedChain) {
            dispatch(fetchUserScripts(chainId, walletAddress));
            dispatch(fetchGasTankBalance(walletAddress, chainId));
            dispatch(fetchGasTankClaimable(walletAddress, chainId));
            dispatch(fetchTipJarBalance(walletAddress, chainId));
            dispatch(fetchDaemBalance(walletAddress, chainId));
            dispatch(fetchEthBalance(walletAddress, chainId));
        }

        // these values do not depend on the user and can be fetched anyway
        if (supportedChain) {
            dispatch(fetchDAEMPriceInEth(chainId));
            dispatch(fetchLatestGasPrice(chainId));
        }
    }, [chainId, walletAddress, authenticated]);

    return (
        <div>
            <ToastContainer />
            <TransactionsVerifier />
            <div className="header">
                <img src={logo} alt="Daemons logo" className="page-logo" />
                <div className="page-logo__beta-sign">BETA</div>
                {authenticated && (
                    <div className="menu">
                        <Link className={dashboardLinkClassName} to="/">
                            Dashboard
                        </Link>
                        <Link className={myPageLinkClassName} to="/my-page">
                            My Page
                        </Link>
                        <Link className={executeLinkClassName} to="/execute">
                            Execute
                        </Link>
                        <Link className={transactionsLinkClassName} to="/transactions">
                            Transactions
                        </Link>
                    </div>
                )}

                <div className="menu__entry menu__entry--tip">
                    <TipIndicator />
                </div>
                <div className="menu__entry menu__entry--gas">
                    <GasIndicator />
                </div>
                <div className="wallet-control">
                    <MetaMaskProvider>
                        {" "}
                        <ConnectWalletButton />{" "}
                    </MetaMaskProvider>
                </div>
            </div>

            <div className="page">{children}</div>
            {authenticated && whitelisted && !banned && (
                <a
                    className="beta-tester-button"
                    target="_blank"
                    href={`mailto:info@daemons.fi?subject=Beta tester report - ${walletAddress}`}
                >
                    <div className="beta-tester-button__icon"></div>
                    <div className="beta-tester-button__content">
                        Hi tester,
                        <br />
                        Thanks for your help, we really appreciate it! Please let us know about any
                        bug, tips, suggestions, doubts you have. Your opinion matters a lot to us!
                    </div>
                </a>
            )}
        </div>
    );
};
