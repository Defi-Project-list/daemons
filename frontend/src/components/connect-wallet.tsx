import React, { Component, ReactNode } from 'react';
import { useMetaMask } from "metamask-react";
import { updateWalletAddress } from '../state/action-creators/wallet-action-creators';
import { useDispatch } from 'react-redux';

const supportedChainIds = new Set<string>(['0x2a']);
const supportedChainName = 'Kovan';

export function ConnectWalletButton() {
    const { status, connect, account, chainId } = useMetaMask();

    const connected = status === 'connected' && supportedChainIds.has(chainId ?? '');
    const walletAddress = connected ? account! : undefined;
    const walletChainId = connected ? chainId! : undefined;

    const dispatcher = useDispatch();
    const dispatchCall = () => dispatcher(updateWalletAddress(connected, walletAddress, walletChainId));

    switch (status) {
        case "initializing":
            return <WalletMessageComponent message={"Syncing..."} dispatchCall={dispatchCall} />;
        case "unavailable":
            return <WalletMessageComponent message={"MetaMask not available :("} dispatchCall={dispatchCall} />;
        case "connecting":
            return <WalletMessageComponent message={"Connecting..."} dispatchCall={dispatchCall} />;
        case "notConnected":
            return <WalletButtonComponent connect={connect} dispatchCall={dispatchCall} />;
        case "connected":
            return <WalletConnectedComponent status={status} account={account} chainId={chainId} dispatchCall={dispatchCall} />;
        default:
            console.error(`Unknown state '${status}'`);
            return null;
    }
}

abstract class WalletComponent extends Component<any> {
    componentDidMount() {
        this.props.dispatchCall();
    }
    componentDidUpdate() {
        this.props.dispatchCall();
    }
}
class WalletMessageComponent extends WalletComponent {
    public render(): ReactNode {
        return <div>{this.props.message}</div>;
    }
}

class WalletButtonComponent extends WalletComponent {
    public render(): ReactNode {
        return <div className="wallet-control__connect-bt" onClick={this.props.connect}>Connect to MetaMask</div>;
    }
}

class WalletConnectedComponent extends WalletComponent {
    public render(): ReactNode {
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>Connected! ({this.props.account!.substr(0, 8) + "..."})</div>
                {
                    supportedChainIds.has(this.props.chainId)
                        ? null
                        : <div className='wallet-control__wrong-network-msg'>Wrong network :(<br />Connect to {supportedChainName} to use the app.  </div>
                }
            </div>
        );
    }
}
