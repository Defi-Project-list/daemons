import React, { Component, ReactNode } from 'react';

import "./app.css";
import { ConnectWalletButton } from './components/connect-wallet';
import { MetaMaskProvider } from "metamask-react";

import logo from './assets/logo.png';

export class App extends Component {

    render(): ReactNode {
        return (
            <div>
                <div className="header">
                    <img src={logo} alt='Balrog logo' className="page-logo" />
                    <div className="menu">
                        <div className="menu__entry">Scripts</div>
                        <div className="menu__entry">Queue</div>
                    </div>

                    <div className="wallet-control"><MetaMaskProvider> <ConnectWalletButton /> </MetaMaskProvider></div>
                </div>

                <div className="page">
                    <div className="Screen">
                        // something will happen here one day..
                    </div>
                </div>
            </div>
        );
    }

}
