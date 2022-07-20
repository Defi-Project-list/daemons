import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BaseScript } from "@daemons-fi/scripts-definitions";
import { RootState } from "../../state";
import { MyPageScript } from "./user-script";
import "./styles.css";
import { Link } from "react-router-dom";
import { cleanWorkbench } from "../../state/action-creators/workbench-action-creators";
import { Card } from "../../components/card/card";

export function UserScriptsContainer(): JSX.Element {
    const dispatch = useDispatch();
    const userScripts = useSelector((state: RootState) => state.script.userScripts);

    const scripts = userScripts.map((script: BaseScript) => (
        <MyPageScript key={script.getId()} script={script} />
    ));

    const addNewScriptAction = (
        <Link
            onClick={() => dispatch(cleanWorkbench())}
            className="add-new-script-button"
            to={"/new-script"}
        >
            Add New Script
        </Link>
    );

    return (
        <Card
            title="My Scripts"
            iconClass="card__title-icon--script"
            actionComponent={addNewScriptAction}
        >
            <div className="scripts-container">
                {scripts.length > 0 ? scripts : <div>You don't have any script</div>}
            </div>
        </Card>
    );
}
