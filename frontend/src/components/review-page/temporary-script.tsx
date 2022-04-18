import React from "react";
import { ICurrentScript } from "../../script-factories/i-current-script";
import "./styles.css";

export enum State {
    unknown,
    loading,
    done
}
interface ITemporaryScriptProps {
    script: ICurrentScript;
    signatureState: State;
    allowanceState: State;
}

export function TemporaryScript({
    script,
    allowanceState,
    signatureState
}: ITemporaryScriptProps): JSX.Element {
    const getIconFromState = (state: State) =>
        state === State.done
            ? "temporary-script__action-icon--done"
            : state === State.unknown
            ? "temporary-script__action-icon--unknown"
            : "temporary-script__action-icon--loading";
    const signatureIcon = getIconFromState(signatureState);
    const allowanceIcon = getIconFromState(allowanceState);

    return (
        <div className="temporary-script">
            <div className="temporary-script__description">{script.description}</div>
            <div className="temporary-script__actions">
                <div className="temporary-script__single-action">
                    <div className={`temporary-script__action-icon ${signatureIcon}`}></div>
                    <div className="temporary-script__action-text">Signature</div>
                </div>
                <div className="temporary-script__single-action">
                    <div className={`temporary-script__action-icon ${allowanceIcon}`}></div>
                    <div className="temporary-script__action-text">Allowance</div>
                </div>
            </div>
        </div>
    );
}
