import React, { useEffect, useState } from "react";
import { BaseScript } from "@daemons-fi/scripts-definitions";
import { RootState, useAppSelector } from "../../state";
import { QueueScriptComponent } from "./executable-script";
import { Card } from "../../components/card/card";
import { TooltipSize } from "../../components/tooltip";
import { StorageProxy } from "../../data/storage-proxy";
import "./styles.css";

export function ExecutableScriptsContainer() {
    const chainId = useAppSelector((state: RootState) => state.user.chainId);
    const [scripts, setScripts] = useState<BaseScript[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [executableScripts, setExecutableScripts] = useState<Set<string>>(new Set());

    const reloadScripts = async () => {
        setIsLoading(true);
        const scripts = await StorageProxy.script.fetchScripts(chainId);
        setScripts(scripts);
        setExecutableScripts(new Set());
        setIsLoading(false);
    };

    useEffect(() => {
        reloadScripts();
    }, [chainId]);

    const markAsExecutable = (script: BaseScript, value: boolean) => {
        const executableScriptsCopy = new Set([...executableScripts]);
        value
            ? executableScriptsCopy.add(script.getId())
            : executableScriptsCopy.delete(script.getId());
        setExecutableScripts(executableScriptsCopy);
    };

    const actionComponent = (
        <div className="card__action-button" onClick={reloadScripts}>
            Reload list
            <div
                className={
                    "queue-container__reload-bt " +
                    (isLoading ? "queue-container__reload-bt--loading" : "")
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
            <div className="queue-container">
                {scripts
                    .sort((s1, s2) =>
                        // Place executable scripts on top
                        executableScripts.has(s1.getId()) && !executableScripts.has(s2.getId())
                            ? -1
                            : executableScripts.has(s2.getId()) &&
                              !executableScripts.has(s1.getId())
                            ? 1
                            : 0
                    )
                    .map((script: BaseScript) => (
                        <QueueScriptComponent
                            key={script.getId()}
                            script={script}
                            markAsExecutable={(value: boolean) => markAsExecutable(script, value)}
                        />
                    ))}
            </div>
        </Card>
    );
}
