import React, { useState } from "react";
import { IUser } from "../../data/storage-proxy/auth-proxy";
import { Switch } from "../switch";
import "./settings.css";

interface ISettingsPanelProps {
    user: IUser;
}

export const SettingsPanel = ({ user }: ISettingsPanelProps): JSX.Element => {
    const [showTutorial, setShowTutorial] = useState<boolean>(user?.showTutorial ?? false);

    return (
        <div className="profile-settings">
            <div className="profile-settings__title">Settings</div>

            <div className="profile-settings__row">
                <div className="profile-settings__text">Show tutorial tooltips</div>
                <div className="profile-settings__action">
                    <Switch value={showTutorial} setValue={setShowTutorial} />
                </div>
            </div>
        </div>
    );
};
