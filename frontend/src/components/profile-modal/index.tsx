import React from "react";
import Modal from "react-modal";
import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { RootState, useAppSelector } from "../../state";
import { INotification } from "../../data/storage-proxy/notification-proxy";
import { NotificationsPanel } from "./notifications";
import { SettingsPanel } from "./settings";
import { ProfilePanel } from "./profile";
import "./styles.css";

const profileModalStyles: any = {
    content: {
        width: "350px",
        borderRadius: "5px",
        left: "auto",
        right: "80px",
        top: "70px",
        height: "fit-content",
        maxHeight: "80vh",
        padding: "25px",
        boxShadow: " 0 0 12px 0 rgba(0, 0, 0)",
        background: "var(--body-background)",
        border: "none"
    },
    overlay: {
        backgroundColor: "#191919bb"
    }
};

interface IProfileModalProps {
    isOpen: boolean;
    hideDialog: () => void;
    notifications: INotification[];
    acknowledgeNotifications: (ids: string[]) => void;
}

export function ProfileModal({
    isOpen,
    hideDialog,
    notifications,
    acknowledgeNotifications
}: IProfileModalProps): JSX.Element | null {
    const user: IUserProfile | undefined = useAppSelector((state: RootState) => state.user.userProfile);
    if (!user) return <></>;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={hideDialog}
            style={profileModalStyles}
            ariaHideApp={false}
        >
            <div className="profile-dialog">
                <div className="profile-dialog__close" onClick={hideDialog} />

                <ProfilePanel user={user} closeModal={hideDialog} />
                <SettingsPanel user={user} />
                <NotificationsPanel
                    notifications={notifications}
                    acknowledgeNotifications={acknowledgeNotifications}
                />
            </div>
        </Modal>
    );
}
