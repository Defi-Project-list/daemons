import {
    VerificationState,
    BaseScript,
    VerificationFailedScript,
    getGasLimitForScript
} from "@daemons-fi/scripts-definitions";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { ScriptProxy } from "../../data/storage-proxy/scripts-proxy";
import { RootState, useAppDispatch, useAppSelector } from "../../state";
import { bigNumberToFloat } from "@daemons-fi/contracts";
import { updateUserStats } from "../../state/action-creators/user-action-creators";

export const QueueScriptComponent = ({
    script,
    markAsExecutable
}: {
    script: BaseScript;
    markAsExecutable: (value: boolean) => void;
}) => {
    const dispatch = useAppDispatch();
    const [verification, setVerification] = useState(script.getVerification());
    const walletAddress = useAppSelector((state: RootState) => state.user.address);
    const chainId = useAppSelector((state: RootState) => state.user.chainId);
    const currentGasPrice = useAppSelector((state: RootState) => state.gasPriceFeed.price) ?? 0;
    const currentDAEMPrice = useAppSelector((state: RootState) => state.prices.DAEMPriceInEth) ?? 1;

    // wallet signer and provider
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();

    // script execution reward
    const scriptEthCost = getGasLimitForScript(script.ScriptType).mul(currentGasPrice);
    const scriptDaemCost = script.getMessage().tip as BigNumber;
    const tipWithoutTaxes = bigNumberToFloat(scriptDaemCost) * 0.8;
    const ethToDaem = bigNumberToFloat(scriptEthCost, 6) / currentDAEMPrice;
    const reward = tipWithoutTaxes + ethToDaem;
    const roundedReward = Math.floor(reward * 100000) / 100000;

    const verifyScript = async () => {
        const verification = await script.verify(signer);
        setVerification(verification);
        markAsExecutable(verification.state === VerificationState.valid);

        const isBroken =
            verification.state === VerificationState.errorCode &&
            (verification as VerificationFailedScript).code.includes("[FINAL]");
        if (isBroken) {
            await ScriptProxy.markAsBroken(script.getId());
        }
    };

    const executeScript = async () => {
        const transactionResponse = await script.execute(signer);
        if (!transactionResponse) return;

        transactionResponse.wait().then(() => {
            dispatch(updateUserStats(walletAddress, chainId));
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
        <div
            className={`queue-script ${
                verification.state === VerificationState.valid ? "" : "queue-script--disabled"
            }`}
        >
            <div className="queue-script__id">{script.getId().substring(0, 5)}...</div>
            <div className="queue-script__type">{script.ScriptType}</div>
            <div className="queue-script__reward">+{roundedReward} DAEM</div>
            <div className="queue-script__actions">
                {verification.state === VerificationState.valid ? (
                    <button onClick={executeScript} className="script__button">
                        Execute
                    </button>
                ) : (
                    <div className="queue-script__verification-message" onClick={verifyScript}>
                        {verification.toString()}
                    </div>
                )}
            </div>
        </div>
    );
};
