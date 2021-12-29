import React from 'react';
import { useMetaMask } from "metamask-react";
import { updateWalletAddress } from '../state/action-creators/wallet-action-creators';
import { useDispatch } from 'react-redux';

export function ConnectWalletButton() {
    const { status, connect, account, chainId } = useMetaMask();
    const maticChainId = '0x89';

    const walletAddress = status === 'connected' && chainId === maticChainId ? account : null;
    const dispatcher = useDispatch();
    dispatcher(updateWalletAddress(walletAddress));

    switch (status) {
        case "initializing":
            return <div>Syncing...</div>;
        case "unavailable":
            return <div>MetaMask not available :(</div>;
        case "notConnected":
            return <div className="wallet-control__connect-bt" onClick={connect}>Connect to MetaMask</div>;
        case "connecting":
            return <div>Connecting...</div>;
        case "connected":
            return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>Connected! ({account!.substr(0, 8) + "..."})</div>
                    {chainId === maticChainId ? null : <div className='wallet-control__wrong-network-msg'>Wrong network :(<br />Connect to Polygon to use the app.</div>}
                </div>);
        default:
            console.error(`Unknown state '${status}'`);
            return null;
    }
}
