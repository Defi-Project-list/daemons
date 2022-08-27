import React from "react";
import { BaseScript } from "@daemons-fi/scripts-definitions";
import { RootState, useAppDispatch, useAppSelector } from "../../state";
import { MyPageScript } from "./user-script";
import "./styles.css";
import { Link } from "react-router-dom";
import { cleanWorkbench } from "../../state/action-creators/workbench-action-creators";
import { Card } from "../../components/card/card";

export function UserScriptsContainer(): JSX.Element {
    const dispatch = useAppDispatch();
    const userScripts = useAppSelector((state: RootState) => state.script.userScripts);

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

    const tooltipContent = (
        <div>
            Here you can find your scripts and add new ones.
            <br />
            <br />
            Each script reports its current stats and can be <strong>executed</strong> manually or{" "}
            <strong>revoked</strong> at will.
        </div>
    );

    return (
        <Card
            title="My Scripts"
            iconClass="card__title-icon--script"
            actionComponent={addNewScriptAction}
            tooltipContent={tooltipContent}
        >
            <div className="scripts-container">
                {scripts.length > 0 ? scripts : <div>You don't have any script</div>}
            </div>
        </Card>
    );
}
