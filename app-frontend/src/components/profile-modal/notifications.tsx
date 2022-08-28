import React from "react";
import { INotification } from "../../data/storage-proxy/notification-proxy";
import { GetCurrentChain } from "../../data/chain-info";
import "./notifications.css";

interface INotificationsPanelProps {
    notifications: INotification[];
    acknowledgeNotifications: (ids: string[]) => void;
}

export const NotificationsPanel = ({
    notifications,
    acknowledgeNotifications
}: INotificationsPanelProps): JSX.Element => {
    const ackAll = () => acknowledgeNotifications(notifications.map((n) => n._id));

    return (
        <div className="profile-notifications">
            <div className="profile-notifications__header">
                <div className="profile-notifications__title">Notifications</div>
                {notifications.length > 0 ? (
                    <div
                        className="profile-notifications__acknowledge-all-button"
                        onClick={ackAll}
                    />
                ) : null}
            </div>

            {notifications.length === 0 ? (
                <div className="profile-notifications__none">
                    <div className="profile-notifications__none-icon" />
                    <div className="profile-notifications__message">No notifications</div>
                </div>
            ) : (
                notifications.map((n) => (
                    <Notification
                        notification={n}
                        acknowledge={() => acknowledgeNotifications([n._id])}
                    />
                ))
            )}
        </div>
    );
};

interface INotificationProps {
    notification: INotification;
    acknowledge: () => void;
}

const Notification = ({ notification, acknowledge }: INotificationProps): JSX.Element => {
    const chainIconPath = GetCurrentChain(notification.chainId).iconPath;
    const formattedDate = new Date(notification.date).toLocaleString();
    return (
        <div className="notification">
            <img className="notification__chain-icon" src={chainIconPath} />
            <div>
                <div className="notification__title">{notification.title}</div>
                <div className="notification__date">{formattedDate}</div>
                <div className="notification__description">{notification.description}</div>
            </div>
            <div className="notification__check-button" onClick={acknowledge} />
        </div>
    );
};
