import React, { Dispatch, useRef, useEffect, useState } from "react";
import { useMetaMask } from "metamask-react";
import {
    authenticationCheck,
    updateWalletAddress
} from "../../state/action-creators/wallet-action-creators";
import { useDispatch, useSelector } from "react-redux";
import { BigNumber } from "ethers";
import { RootState } from "../../state";
import { StorageProxy } from "../../data/storage-proxy";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import "./styles.css";
import { INotification, NotificationProxy } from "../../data/storage-proxy/notification-proxy";
import { notificationsPanel } from "./notification-panel";
import { ChainsModal } from "../chains-modal";
import { ProfileModal } from "../profile-modal";
import { IUser } from "../../data/storage-proxy/auth-proxy";

export function ConnectWalletButton() {
    const dispatch = useDispatch();
    const { status, connect, account, chainId } = useMetaMask();

    const connected = status === "connected";
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
            return (
                <div className="wallet-control__connect-bt" onClick={connect}>
                    Connect to MetaMask
                </div>
            );
        case "connected":
            return (
                <ConnectedWalletComponent walletAddress={walletAddress} chainId={walletChainId} />
            );
        default:
            console.error(`Unknown state '${status}'`);
            return null;
    }
}

function ConnectedWalletComponent({ walletAddress, chainId }: any): JSX.Element | null {
    const dispatch = useDispatch();
    const address = walletAddress!.substring(0, 10) + "...";
    const user: IUser | undefined = useSelector((state: RootState) => state.wallet.user);
    const chainInfo = GetCurrentChain(chainId);
    const [displayChains, setDisplayChains] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [displayNotifications, setDisplayNotifications] = useState<boolean>(false);
    const notificationsRef = useRef<HTMLInputElement>(null);

    const getNotifications = async (): Promise<void> => {
        const fetchNotificationsRes = await NotificationProxy.fetchNotifications();
        setNotifications(fetchNotificationsRes);
    };

    useEffect(() => {
        getNotifications();
        setInterval(getNotifications, 300000);
    }, []);

    const closeNotificationsOnClickOut = (e: any) => {
        if (
            notificationsRef.current &&
            displayNotifications &&
            !notificationsRef.current.contains(e.target)
        ) {
            setDisplayNotifications(false);
        }
    };

    document.addEventListener("mousedown", closeNotificationsOnClickOut);

    return (
        <div ref={notificationsRef} className="wallet-connector">
            <div className="wallet-connector__chain">
                <img
                    className="wallet-connector__chain-image"
                    src={chainInfo.iconPath}
                    onClick={() => setDisplayChains(!displayChains)}
                />
            </div>

            {user ? (
                <>
                    <div className="wallet-connector__address">
                        {address}
                        {notifications.length > 0 && (
                            <div
                                className="wallet-connector__address-notification"
                                onClick={() => setDisplayNotifications(!displayNotifications)}
                            >
                                {notifications.length}
                            </div>
                        )}
                    </div>
                    {displayNotifications &&
                        notificationsPanel(
                            () => setDisplayNotifications(false),
                            notifications,
                            getNotifications
                        )}
                </>
            ) : (
                <div
                    className="wallet-connector__address wallet-connector__address--unauthenticated"
                    onClick={() => triggerLogin(walletAddress, dispatch)}
                >
                    <div>{address}</div>
                    <div>Authenticate</div>
                </div>
            )}

            {/* Modals */}
            {displayChains && (
                <ChainsModal
                    isOpen={displayChains}
                    hideDialog={() => setDisplayChains(false)}
                    selectedChainId={chainId}
                />
            )}
        </div>
    );
}

async function triggerLogin(walletAddress: string, dispatch: Dispatch<any>): Promise<void> {
    const message = await StorageProxy.auth.getLoginMessage(walletAddress);
    const signedMessage = await getSignature(message);
    await StorageProxy.auth.login(walletAddress, signedMessage);
    dispatch(authenticationCheck(walletAddress));
}

async function getSignature(message: string): Promise<any> {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
}
