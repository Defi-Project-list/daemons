import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BaseScript } from "../../data/script/base-script";
import { VerificationState } from "../../data/script/verification-result";
import { StorageProxy } from "../../data/storage-proxy";
import { RootState } from "../../state";
import { fetchGasTankClaimable } from "../../state/action-creators/gas-tank-action-creators";

export const QueueScriptComponent = ({ script }: { script: BaseScript }) => {
    const dispatch = useDispatch();
    const [verification, setVerification] = useState(script.getVerification());
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);

    const verifyScript = async () => {
        setVerification(await script.verify());
    };
    const executeScript = async () => {
        const transactionResponse = await script.execute();
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
        <div className="queue-script">
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
