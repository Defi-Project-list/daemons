import React, { Dispatch, useRef, useEffect, useState } from "react";
import { useMetaMask } from "metamask-react";
import {
    authenticationCheck,
    updateWalletAddress
} from "../../state/action-creators/user-action-creators";
import { useDispatch, useSelector } from "react-redux";
import { BigNumber } from "ethers";
import { RootState } from "../../state";
import { StorageProxy } from "../../data/storage-proxy";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { INotification, NotificationProxy } from "../../data/storage-proxy/notification-proxy";
import { ChainsModal } from "../chains-modal";
import { ProfileModal } from "../profile-modal";
import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import "./styles.css";
import { useNavigate } from "react-router-dom";

export function ConnectWalletButton() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, connect, account, chainId } = useMetaMask();

    const connected = status === "connected";
    const walletAddress = connected ? account! : undefined;
    const walletChainId = connected ? BigNumber.from(chainId!).toString() : undefined; // convert from hex to decimal string
    const supportedChain = !!walletChainId && IsChainSupported(walletChainId);
    const [currentChainId, setCurrentChainId] = useState<string|undefined>();

    useEffect(() => {
        // update the state and check for authentication each time there is a change
        dispatch(updateWalletAddress(connected, supportedChain, walletAddress, walletChainId));
        dispatch(authenticationCheck(walletAddress, walletChainId));
    }, [status, connected, walletAddress, walletChainId]);

    useEffect(() => {
        if (currentChainId && currentChainId !== chainId) {
            // chain id has changed, send to home to prevent errors
            navigate("/")
        }
        setCurrentChainId(chainId ?? undefined);
    }, [chainId])

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
    const user: IUserProfile | undefined = useSelector(
        (state: RootState) => state.user.userProfile
    );
    const chainInfo = GetCurrentChain(chainId);
    const [displayChains, setDisplayChains] = useState<boolean>(false);
    const [displayProfile, setDisplayProfile] = useState<boolean>(false);
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

    const acknowledgeNotifications = (ids: string[]) => {
        NotificationProxy.acknowledgeNotifications(ids);
        const newNotifications = notifications.filter((n) => !ids.includes(n._id));
        setNotifications(newNotifications);
    };

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
                <div className="wallet-connector__address" onClick={() => setDisplayProfile(true)}>
                    <div className="wallet-connector__address-text">{user.username}</div>
                    {notifications.length > 0 && (
                        <div className="wallet-connector__address-notification">
                            {notifications.length}
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className="wallet-connector__address wallet-connector__address--unauthenticated"
                    onClick={() => triggerLogin(walletAddress, dispatch, chainId)}
                >
                    <div className="wallet-connector__address-text">{walletAddress}</div>
                    <div>Authenticate</div>
                </div>
            )}

            {/* Modals */}
            <ChainsModal
                isOpen={displayChains}
                hideDialog={() => setDisplayChains(false)}
                selectedChainId={chainId}
            />
            <ProfileModal
                isOpen={displayProfile}
                hideDialog={() => setDisplayProfile(false)}
                notifications={notifications}
                acknowledgeNotifications={acknowledgeNotifications}
            />
        </div>
    );
}

async function triggerLogin(
    walletAddress: string,
    dispatch: Dispatch<any>,
    chainId: string
): Promise<void> {
    const message = await StorageProxy.auth.getLoginMessage(walletAddress);
    const signedMessage = await getSignature(message);
    await StorageProxy.auth.login(walletAddress, signedMessage);
    dispatch(authenticationCheck(walletAddress, chainId));
}

async function getSignature(message: string): Promise<any> {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
}
