import React, { useState } from 'react';
import { BaseScript, VerificationState } from '../../data/script/base-script';


export const QueueScriptComponent = ({ script }: { script: BaseScript; }) => {
    const [verificationState, setVerificationState] = useState(script.getVerificationState());

    const verifyScript = async () => { setVerificationState(await script.verify()); };
    const executeScript = async () => { console.log(await script.execute()); };

    if (verificationState === VerificationState.unverified) {
        verifyScript();
    }

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
