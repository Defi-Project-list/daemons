import React from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { IUser } from "../../data/storage-proxy/auth-proxy";
import "./profile.css";

interface IProfilePanelProps {
    user: IUser;
}

export const ProfilePanel = ({ user }: IProfilePanelProps): JSX.Element => {
    const username = user.username !== user.address ? user.username : undefined;

    return (
        <div className="profile">
        <div className="profile__picture">
            <Jazzicon diameter={80} seed={jsNumberForAddress(user.address)} />
        </div>
        <div className="profile__info">
            <div className="profile__username-row">
                <div className="profile__username-button" />
                {username ? (
                    <div className="profile__username">{user.username}</div>
                ) : (
                    <div className="profile__username profile__username--empty">
                        No Username
                    </div>
                )}
            </div>
            <div className="profile__address">{user.address}</div>
        </div>
    </div>
    );
};
