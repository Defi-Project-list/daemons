import React from "react";
import { useDispatch } from "react-redux";
import { StorageProxy } from "../../data/storage-proxy";
import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { updateTutorialTooltip } from "../../state/action-creators/user-action-creators";
import { Switch } from "../switch";
import { errorToast } from "../toaster";
import "./settings.css";

interface ISettingsPanelProps {
    user: IUserProfile;
}

export const SettingsPanel = ({ user }: ISettingsPanelProps): JSX.Element => {
    const dispatch = useDispatch();

    const setShowTooltip = async (value: boolean) => {
        dispatch(updateTutorialTooltip(value));
        const error = await StorageProxy.profile.updateTutorialTooltip(value);
        if (error) {
            // restore initial value and show message
            dispatch(updateTutorialTooltip(!value));
            errorToast(error);
        }
    };

    return (
        <div className="profile-settings">
            <div className="profile-settings__title">Settings</div>

            <div className="profile-settings__row">
                <div className="profile-settings__text">Show tutorial tooltips</div>
                <div className="profile-settings__action">
                    <Switch value={user?.showTutorial ?? true} setValue={setShowTooltip} />
                </div>
            </div>
        </div>
    );
};
