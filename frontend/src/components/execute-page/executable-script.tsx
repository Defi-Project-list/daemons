import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BaseScript, VerificationState } from '../../data/script/base-script';
import { StorageProxy } from '../../data/storage-proxy';
import { RootState } from '../../state';
import { fetchGasTankClaimable } from '../../state/action-creators/gas-tank-action-creators';


export const QueueScriptComponent = ({ script }: { script: BaseScript; }) => {
    const dispatch = useDispatch();
    const [verificationState, setVerificationState] = useState(script.getVerificationState());
    const walletAddress = useSelector((state: RootState) => state.wallet.address);

    const verifyScript = async () => { setVerificationState(await script.verify()); };
    const executeScript = async () => {
        const transactionResponse = await script.execute();
        if (!transactionResponse) return;

        await StorageProxy.addTransaction(transactionResponse, script, walletAddress!);
        transactionResponse.wait().then(() => dispatch(fetchGasTankClaimable(walletAddress)));
    };

    useEffect(() => {
        if (verificationState === VerificationState.unverified) {
            verifyScript();
        }
    }, []);

    return (
        <div className="queue-script">
            <div className="queue-script__id">{script.getId().substring(0, 5)}...</div>
            <div className="queue-script__type">{script.ScriptType}</div>
            <div className="queue-script__actions">
                {
                    verificationState === VerificationState.valid
                        ? <button onClick={executeScript} className='script__button'>Execute</button>
                        : <div>{verificationState}</div>
                }
            </div>
        </div>
    );
};
