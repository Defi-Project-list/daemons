import React, { Dispatch, useEffect } from 'react';
import { useMetaMask } from "metamask-react";
import { authenticationCheck, updateWalletAddress } from '../../state/action-creators/wallet-action-creators';
import { useDispatch, useSelector } from 'react-redux';
import { BigNumber } from 'ethers';
import { RootState } from '../../state';
import { StorageProxy } from '../../data/storage-proxy';
import { GetCurrentChain, IsChainSupported } from '../../data/chain-info';
import './styles.css';


export function ConnectWalletButton() {
    const dispatch = useDispatch();
    const { status, connect, account, chainId } = useMetaMask();

    const connected = status === 'connected';
    const walletAddress = connected ? account! : undefined;
    const walletChainId = connected ? BigNumber.from(chainId!).toString() : undefined; // convert from hex to decimal string
    const supportedChain = !!walletChainId && IsChainSupported(walletChainId);

    useEffect(() => {
        // update the state and check for authentication each time there is a change
        dispatch(updateWalletAddress(connected, supportedChain, walletAddress, walletChainId));
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
            return <ConnectedWalletComponent walletAddress={walletAddress} chainId={walletChainId} />;
        default:
            console.error(`Unknown state '${status}'`);
            return null;
    }
}

function ConnectedWalletComponent({ walletAddress, chainId }: any): JSX.Element | null {
    const dispatch = useDispatch();
    const address = walletAddress!.substring(0, 16) + "...";
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const chainInfo = GetCurrentChain(chainId);

    return (
        <div className='wallet-connector'>
            <div className='wallet-connector__chain'>
                <img className='wallet-connector__chain-image' src={chainInfo.iconPath} />
            </div>

            {
                authenticated
                    ? (
                        <div className='wallet-connector__address'>{address}</div>
                    )
                    : (
                        <div className='wallet-connector__address wallet-connector__address--unauthenticated'
                            onClick={() => triggerLogin(walletAddress, dispatch)}>
                            <div>{address}</div>
                            <div>Authenticate</div>
                        </div>
                    )
            }
        </div >
    );


    if (!authenticated) {
        return <button onClick={() => triggerLogin(walletAddress, dispatch)}>Login</button>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>Connected! ({walletAddress!.substring(0, 8) + "..."})</div>
        </div>
    );

}

async function triggerLogin(walletAddress: string, dispatch: Dispatch<any>): Promise<void> {
    const message = await StorageProxy.authentication.getLoginMessage(walletAddress);
    const signedMessage = await getSignature(message);
    await StorageProxy.authentication.login(walletAddress, signedMessage);
    dispatch(authenticationCheck(walletAddress));
}

async function getSignature(message: string): Promise<any> {
    const ethers = require('ethers');
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
}
