import {
    VerificationState,
    BaseScript,
    VerificationFailedScript
} from "@daemons-fi/scripts-definitions";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StorageProxy } from "../../data/storage-proxy";
import { ScriptProxy } from "../../data/storage-proxy/scripts-proxy";
import { RootState } from "../../state";
import { fetchGasTankClaimable } from "../../state/action-creators/gas-tank-action-creators";
import { removeExecutableScript } from "../../state/action-creators/script-action-creators";

export const QueueScriptComponent = ({ script }: { script: BaseScript }) => {
    const dispatch = useDispatch();
    const [verification, setVerification] = useState(script.getVerification());
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);

    // wallet signer and provider
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();

    const verifyScript = async () => {
        const verification = await script.verify(signer);
        setVerification(verification);

        const isBroken =
            verification.state === VerificationState.errorCode &&
            (verification as VerificationFailedScript).code.includes("[FINAL]");
        if (isBroken) {
            await ScriptProxy.markAsBroken(script.getId());
            dispatch(removeExecutableScript(script));
        }
    };

    const executeScript = async () => {
        const transactionResponse = await script.execute(signer);
        if (!transactionResponse) return;

        await StorageProxy.txs.addTransaction(transactionResponse, script, walletAddress!);
        transactionResponse.wait().then(() => {
            dispatch(fetchGasTankClaimable(walletAddress, chainId));
            verifyScript();
        });
        setVerification(script.getVerification());
    };

    useEffect(() => {
        if (verification.state === VerificationState.unverified) {
            verifyScript();
        }
    }, []);

    return (
        <div className={`queue-script ${verification.state === VerificationState.valid ? '' : 'queue-script--disabled'}`}>
            <div className="queue-script__id">{script.getId().substring(0, 5)}...</div>
            <div className="queue-script__type">{script.ScriptType}</div>
            <div className="queue-script__actions">
                {verification.state === VerificationState.valid ? (
                    <button onClick={executeScript} className="script__button">
                        Execute
                    </button>
                ) : (
                    <div>{verification.toString()}</div>
                )}
            </div>
        </div>
    );
};
