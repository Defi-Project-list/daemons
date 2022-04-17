import React, { useState } from "react";
import { ScriptFactory } from "../../script-factories";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state";
import { TemporaryScript } from "./temporary-script";
import "./styles.css";
import { StorageProxy } from "../../data/storage-proxy";
import { addNewScript } from "../../state/action-creators/script-action-creators";
import { BaseScript } from "../../data/script/base-script";
import { Navigate } from "react-router-dom";
import { cleanWorkbench } from "../../state/action-creators/workbench-action-creators";
import { ICurrentScript } from "../../script-factories/i-current-script";
import {
    IFollowConditionForm,
    ScriptConditions
} from "../../data/chains-data/condition-form-interfaces";
import { getExecutorFromScriptAction } from "../../script-factories/messages-factories/executor-fetcher";
import { ConditionTitles } from "../../data/chains-data/interfaces";

export function ReviewPage(): JSX.Element {
    // redux
    const dispatch = useDispatch();
    const chainId: string | undefined = useSelector((state: RootState) => state.wallet.chainId);
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);
    const workbenchScripts = useSelector((state: RootState) => state.workbench.scripts);

    // states
    const [redirect, setRedirect] = useState<boolean>(false);

    const createAndSignScripts = async () => {
        if (!chainId) throw new Error("Cannot create the script! The chain is unknown");
        if (!workbenchScripts.length)
            throw new Error("Cannot create the script! Current script is empty");

        // copying scripts so to be free to modify them
        const scripts: ICurrentScript[] = JSON.parse(JSON.stringify(workbenchScripts));
        addFollowConditions(scripts);
        console.log(scripts);

        const scriptFactory = new ScriptFactory(chainId);
        const signedScripts: BaseScript[] = [];
        for (const script of scripts) {
            const signedScript = await scriptFactory.SubmitScriptsForSignature(script);
            if (!(await signedScript.hasAllowance())) {
                await signedScript.requestAllowance();
            }

            signedScripts.push(signedScript);
        }

        for (const signedScript of signedScripts) {
            await StorageProxy.script.saveScript(signedScript);
            dispatch(addNewScript(signedScript));
        }

        dispatch(cleanWorkbench());
        setRedirect(true);
    };

    const addFollowConditions = (scripts: ICurrentScript[]) => {
        // add follow conditions to chain scripts together
        if (scripts.length >= 2) {
            for (let i = 1; i < scripts.length; i++) {
                scripts[i].conditions[ConditionTitles.FOLLOW] = {
                    title: ConditionTitles.FOLLOW,
                    info: "Automatically added follow-condition",
                    form: {
                        type: ScriptConditions.FOLLOW,
                        valid: true,
                        shift: 0,
                        parentScriptId: scripts[i - 1].id,
                        parentScriptExecutor: getExecutorFromScriptAction(
                            scripts[i - 1].action.form.type,
                            chainId!
                        )
                    } as IFollowConditionForm
                };
            }

            // first script will only be re-executable only when the last one has been executed
            // to do so we add a follow condition with shift 1.
            scripts[0].conditions[ConditionTitles.FOLLOW] = {
                title: ConditionTitles.FOLLOW,
                info: "Automatically added follow-condition",
                form: {
                    type: ScriptConditions.FOLLOW,
                    valid: true,
                    shift: 1,
                    parentScriptId: scripts[scripts.length - 1].id,
                    parentScriptExecutor: getExecutorFromScriptAction(
                        scripts[scripts.length - 1].action.form.type,
                        chainId!
                    )
                } as IFollowConditionForm
            };
        }
    };

    const shouldRedirect = redirect || !authenticated || !supportedChain;
    console.log("shouldRedirect", redirect);
    if (shouldRedirect) return <Navigate to="/my-page" />;

    return (
        <div className="review">
            <div className="review__scripts">
                {workbenchScripts.map((script) => (
                    <TemporaryScript key={script.id} script={script} />
                ))}
            </div>

            <button className="review__deploy-button" onClick={createAndSignScripts}>
                {workbenchScripts.length === 1
                    ? `Sign & deploy script`
                    : `Sign & Deploy ${workbenchScripts.length} scripts`}
            </button>
        </div>
    );
}
