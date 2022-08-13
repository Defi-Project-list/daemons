import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { StorageProxy } from "../../data/storage-proxy";
import { updateUsername } from "../../state/action-creators/user-action-creators";
import { errorToast, successToast } from "../toaster";

interface IUsernameProps {
    username: string | undefined;
}

export const Username = ({ username }: IUsernameProps): JSX.Element => {
    const dispatch = useDispatch();
    const [editingUsername, setEditingUsername] = useState<boolean>(false);
    const [currentUsername, setCurrentUsername] = useState<string>(username ?? "");
    const [editedUsername, setEditedUsername] = useState<string>(currentUsername);

    const saveUsername = async () => {
        const newUsername = cleanUsername(
            (document.getElementById("id-add-username") as HTMLInputElement).value
        );

        if (newUsername === currentUsername) {
            setEditingUsername(false);
            return;
        }

        let errors = !checkUsername(newUsername)
            ? "Username should contains between 3 and 12 alphanumeric characters"
            : "";
        if (!errors) {
            errors = await StorageProxy.profile.updateUsername(newUsername);
        }

        if (!errors) {
            setCurrentUsername(newUsername);
            setEditedUsername(newUsername);
            dispatch(updateUsername(newUsername));
            successToast(`Username successfully changed. Hi ${newUsername}!`);
        } else {
            errorToast(errors);
            setEditedUsername(currentUsername);
        }

        setEditingUsername(false);
    };

    const cleanUsername = (username: string) =>
        username
            .trim()
            .substring(0, 12)
            .replace(/[^A-Za-z0-9]/g, "");

    const checkUsername = (username: string) => username.length > 3 && username.length <= 12;

    useEffect(() => {
        if (editingUsername) document.getElementById("id-add-username")?.focus();
    }, [editingUsername]);

    return (
        <div className="profile__username-row">
            {!editingUsername ? (
                <>
                    <div
                        className="profile__username-button profile__username-button--edit"
                        onClick={() => setEditingUsername(true)}
                    />
                    <div
                        className={`profile__username ${
                            !currentUsername ? "profile__username--empty" : ""
                        }`}
                    >
                        {currentUsername ? currentUsername : "No Username"}
                    </div>
                </>
            ) : (
                <>
                    <div
                        className="profile__username-button profile__username-button--save"
                        onClick={saveUsername}
                    />
                    <input
                        type="text"
                        id="id-add-username"
                        className="profile__username-input"
                        maxLength={12}
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(cleanUsername(e.target.value))}
                    />
                </>
            )}
        </div>
    );
};
