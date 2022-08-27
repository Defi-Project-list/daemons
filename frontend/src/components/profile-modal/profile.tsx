import React from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { AuthProxy, IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { authenticationCheck } from "../../state/action-creators/user-action-creators";
import { Username } from "./username";
import "./profile.css";
import { useAppDispatch } from "../../state";

interface IProfilePanelProps {
    user: IUserProfile;
    closeModal: () => void;
}

export const ProfilePanel = ({ user, closeModal: closePanel }: IProfilePanelProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const username = user.username !== user.address ? user.username : undefined;

    const logOut = async () => {
        await AuthProxy.logout();
        closePanel();
        dispatch(authenticationCheck());
    };

    return (
        <div className="profile">
            <div className="profile__picture">
                <Jazzicon diameter={80} seed={jsNumberForAddress(user.address)} />
            </div>
            <div className="profile__info">
                {/* Username */}
                <Username username={username} />

                {/* Address */}
                <div className="profile__address">{user.address}</div>

                {/* Disconnect button */}
                <div className="profile__disconnect" onClick={logOut}>
                    <div className="profile__disconnect-icon" />
                    <div className="profile__disconnect-text">Log out</div>
                </div>
            </div>
        </div>
    );
};
