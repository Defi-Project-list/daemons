import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BaseScript } from "@daemons-fi/scripts-definitions";
import { RootState } from "../../state";
import { fetchExecutableScripts } from "../../state/action-creators/script-action-creators";
import { toggleScriptsLoading } from "../../state/action-creators/script-action-creators";
import { QueueScriptComponent } from "./executable-script";
import { Card } from "../../components/card/card";
import "./styles.css";
import { TooltipSize } from "../../components/tooltip";

export function ExecutableScriptsContainer() {
    const dispatch = useDispatch();
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const fetchedScripts = useSelector((state: RootState) => state.script.allScripts);
    const loading = useSelector((state: RootState) => state.script.loading);
    const [scriptsChain, setScriptsChain] = useState<string>("");

    const reloadScripts = async () => {
        dispatch(toggleScriptsLoading());
        dispatch(fetchExecutableScripts(chainId));
    };

    useEffect(() => {
        if (fetchedScripts.length === 0 || scriptsChain !== chainId) {
            reloadScripts();
            setScriptsChain(chainId!);
        }
    }, [chainId]);

    const scripts = fetchedScripts.map((script: BaseScript) => (
        <QueueScriptComponent key={script.getId()} script={script} />
    ));

    const actionComponent = (
        <div className="card__action-button" onClick={reloadScripts}>
            Reload list
            <div
                className={
                    "queue-container__reload-bt " +
                    (loading ? "queue-container__reload-bt--loading" : "")
                }
            />
        </div>
    );

    const tooltipContent = (
        <div>
            Here you will find the platform scripts that can be executed.
            <br />
            <br />
            We will automatically check their state and the only thing you will have to do is to
            press the "Execute" button and get the reward.
            <br />
            <br />
            All these scripts will be executed safely by the Daemons smart contracts.
        </div>
    );

    return (
        <Card
            title="Executable Scripts"
            iconClass="card__title-icon--script"
            actionComponent={actionComponent}
            tooltipContent={tooltipContent}
            tooltipSize={TooltipSize.Large}
        >
            <div className="card__subtitle">Execute scripts and get rewarded in DAEM tokens</div>
            <div className="queue-container">{scripts}</div>
        </Card>
    );
}
