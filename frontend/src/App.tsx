import React, { useEffect } from 'react';
import { ConnectWalletButton } from './components/connect-wallet';
import { MetaMaskProvider } from "metamask-react";
import { Link } from 'react-router-dom';
import logo from './assets/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './state';
import GasIndicator from './components/gas-indicator';
import { fetchUserScripts } from './state/action-creators/script-action-creators';
import { fetchGasTankBalance } from './state/action-creators/gas-tank-action-creators';
import { fetchChainTokens } from './state/action-creators/tokens-action-creators';

import "./constants.css";
import "./app.css";

export const App = ({ children }: { children: any; }) => {
    // redux
    const dispatch = useDispatch();
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const walletAddress: string | undefined = useSelector((state: RootState) => state.wallet.address);

    // menu selection classes
    const queueLinkClassName = `menu__entry ${document.location.href.endsWith('/queue') ? 'menu__entry--selected' : ''}`;
    const newScriptLinkClassName = `menu__entry ${document.location.href.endsWith('/new-script') ? 'menu__entry--selected' : ''}`;
    const gasTankLinkClassName = `menu__entry ${document.location.href.endsWith('/gas-tank') ? 'menu__entry--selected' : ''}`;
    const scriptsLinkClassName = `menu__entry ${document.location.href.endsWith('/') || document.location.href.endsWith('/scripts') ? 'menu__entry--selected' : ''}`;

    useEffect(() => {
        // reload the user scripts and balance each time the chain or the address change
        dispatch(fetchChainTokens(chainId));
        dispatch(fetchUserScripts(chainId, walletAddress));
        dispatch(fetchGasTankBalance(walletAddress));
    }, [chainId, walletAddress]);

    return (
        <div>
            <div className="header">
                <img src={logo} alt='Daemons logo' className="page-logo" />
                <div className="menu">
                    <Link className={scriptsLinkClassName} to="/scripts">Scripts</Link>
                    <Link className={newScriptLinkClassName} to="/new-script">New Script</Link>
                    <Link className={gasTankLinkClassName} to="/gas-tank">Gas Tank</Link>
                    <Link className={queueLinkClassName} to="/queue">Queue</Link>
                </div>

                <div className="menu__entry menu__entry--gas"><GasIndicator /></div>
                <div className="wallet-control"><MetaMaskProvider> <ConnectWalletButton /> </MetaMaskProvider></div>
            </div>

            <div className="page">
                {children}
            </div>
        </div>
    );
};
