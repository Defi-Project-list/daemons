import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BaseScript } from "@daemons-fi/scripts-definitions";
import { VerificationFailedScript, VerificationState } from "@daemons-fi/scripts-definitions";
import { RootState } from "../../state";
import { fetchGasTankClaimable } from "../../state/action-creators/gas-tank-action-creators";
import { removeScript } from "../../state/action-creators/script-action-creators";
import { ethers } from "ethers";
import { promiseToast } from "../toaster";

export const MyPageScript = ({ script }: { script: BaseScript }) => {
    const [verification, setVerification] = useState(script.getVerification());
    const dispatch = useDispatch();
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);

    // wallet signer and provider
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();

    const revokeScript = async () => {
        const tx = await script.revoke(signer);

        const revokeTransaction = promiseToast(
            tx.wait,
            `Revoking script ${script.getShortId()}. Please do not leave Daemons`,
            "Script successfully revoked 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await revokeTransaction;
        dispatch(removeScript(script));
    };
    const verifyScript = async () => {
        setVerification(await script.verify(signer));
    };
    const executeScript = async () => {
        const tx = await script.execute(signer);
        setVerification(script.getVerification());
        dispatch(fetchGasTankClaimable(walletAddress, chainId));
        tx?.wait().then(() => verifyScript());
    };
    const requestAllowance = async () => {
        const tx = await script.requestAllowance(signer);
        const allowanceTransaction = promiseToast(
            tx.wait,
            `Giving the necessary allowance to Daemons to execute this script`,
            "Allowance successfully granted 🎉",
            "Something bad happened. Contact us if the error persists"
        );
        await allowanceTransaction;
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
