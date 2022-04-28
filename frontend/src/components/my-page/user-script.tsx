import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BaseScript } from "../../data/script/base-script";
import { VerificationFailedScript, VerificationState } from "../../data/script/verification-result";
import { RootState } from "../../state";
import { fetchGasTankClaimable } from "../../state/action-creators/gas-tank-action-creators";
import { removeScript } from "../../state/action-creators/script-action-creators";

export const MyPageScript = ({ script }: { script: BaseScript }) => {
    const [verification, setVerification] = useState(script.getVerification());
    const dispatch = useDispatch();
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);

    const revokeScript = async () => {
        await script.revoke();
        dispatch(removeScript(script));
    };
    const verifyScript = async () => {
        setVerification(await script.verify());
    };
    const executeScript = async () => {
        const tx = await script.execute();
        setVerification(script.getVerification());
        dispatch(fetchGasTankClaimable(walletAddress, chainId));
        tx?.wait().then(() => verifyScript());
    };
    const requestAllowance = async () => {
        await script.requestAllowance();
        await verifyScript();
    };

    if (verification.state === VerificationState.unverified) {
        verifyScript();
    }

    return (
        <div className="script">
            <div className="script__description">{script.getDescription()}</div>
            <div className="script__verificationState">{verification.toString()}</div>
            <div className="script__actions">
                <button onClick={revokeScript} className="script__button">
                    Revoke
                </button>
                <button onClick={verifyScript} className="script__button">
                    Verify
                </button>

                {verification.state === VerificationState.valid ? (
                    <button onClick={executeScript} className="script__button">
                        Execute
                    </button>
                ) : verification.state === VerificationState.errorCode &&
                  (verification as VerificationFailedScript).code.includes("ALLOWANCE") ? (
                    <button onClick={requestAllowance} className="script__button">
                        Require Allowance
                    </button>
                ) : null}
            </div>
            <button
                onClick={() => alert(JSON.stringify(script.getMessage(), null, " "))}
                className="script__info-button"
            >
                i
            </button>
        </div>
    );
};
