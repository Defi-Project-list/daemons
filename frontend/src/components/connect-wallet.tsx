import React, { useEffect } from 'react';
import { useMetaMask } from "metamask-react";
import { authenticationCheck, updateWalletAddress } from '../state/action-creators/wallet-action-creators';
import { useDispatch, useSelector } from 'react-redux';
import { BigNumber } from 'ethers';
import { RootState } from '../state';
import { StorageProxy } from '../data/storage-proxy';

const supportedChainIds = new Set<string>(['0x2a']);
const supportedChainName = 'Kovan';


export function ConnectWalletButton() {
    const dispatch = useDispatch();
    const { status, connect, account, chainId } = useMetaMask();

    const connected = status === 'connected' && supportedChainIds.has(chainId ?? '');
    const walletAddress = connected ? account! : undefined;
    const walletChainId = connected ? BigNumber.from(chainId!).toString() : undefined; // convert from hex to decimal string

    useEffect(() => {
        // update the state and check for authentication each time there is a change
        dispatch(updateWalletAddress(connected, walletAddress, walletChainId));
        dispatch(authenticationCheck(walletAddress));
    }, [status, connected, walletAddress, walletChainId]);

    switch (status) {
        case "initializing":
            return <div>Syncing...</div>;
        case "unavailable":
            return <div>MetaMask not available :(</div>;
        case "connecting":
            return <div>Connecting...</div>;
        case "notConnected":
            return <div className="wallet-control__connect-bt" onClick={connect}>Connect to MetaMask</div>;
        case "connected":
            return <ConnectedWalletComponent walletAddress={walletAddress} chainId={chainId} />;
        default:
            console.error(`Unknown state '${status}'`);
            return null;
    }
}

function ConnectedWalletComponent({ walletAddress, chainId }: any): JSX.Element | null {
    const dispatch = useDispatch();
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);

    if (!authenticated) {
        const login = async () => {
            const message = await StorageProxy.getLoginMessage(walletAddress);
            const signedMessage = await getSignature(message);
            await StorageProxy.login(walletAddress, signedMessage);
            dispatch(authenticationCheck(walletAddress));
        };
        return <button onClick={login}>Login</button>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>Connected! ({walletAddress!.substring(0, 8) + "..."})</div>
            {
                supportedChainIds.has(chainId!)
                    ? null
                    : <div className='wallet-control__wrong-network-msg'>Wrong network :(<br />Connect to {supportedChainName} to use the app.  </div>
            }
        </div>
    );

}

async function getSignature(message: string): Promise<any> {
    const ethers = require('ethers');
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
}
