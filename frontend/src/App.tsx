import React from 'react';
import { ConnectWalletButton } from './components/connect-wallet';
import { MetaMaskProvider } from "metamask-react";
import { Link } from 'react-router-dom';
import logo from './assets/logo.png';
import { Provider } from 'react-redux';
import { store } from './state';

import "./app.css";

export const App = ({ children }: { children: any; }) => {
    const queueLinkClassName = `menu__entry ${document.location.href.endsWith('/queue') ? 'menu__entry--selected' : ''}`;
    const newScriptLinkClassName = `menu__entry ${document.location.href.endsWith('/new-script') ? 'menu__entry--selected' : ''}`;
    const scriptsLinkClassName = `menu__entry ${document.location.href.endsWith('/') || document.location.href.endsWith('/scripts') ? 'menu__entry--selected' : ''}`;

    return (
        <Provider store={store}>
            <div className="header">
                <img src={logo} alt='Balrog logo' className="page-logo" />
                <div className="menu">
                    <Link className={scriptsLinkClassName} to="/scripts">Scripts</Link>
                    <Link className={newScriptLinkClassName} to="/new-script">New Script</Link>
                    <Link className={queueLinkClassName} to="/queue">Queue</Link>
                </div>

                <div className="wallet-control"><MetaMaskProvider> <ConnectWalletButton /> </MetaMaskProvider></div>
            </div>
            <hr />

            <div className="page">
                {children}
            </div>
        </Provider>
    );
};
