import React, { useState } from 'react';
import { BaseScript, VerificationState } from '../../data/script/base-script';

interface IScriptComponentsProps {
    script: BaseScript;
    fetchScripts: () => Promise<void>;
}

export const ScriptComponent = ({ script, fetchScripts }: IScriptComponentsProps) => {
    const [verificationState, setVerificationState] = useState(script.getVerificationState());

    if (verificationState === VerificationState.unverified) {
        script.verify().then(verificationState => setVerificationState(verificationState));
    }

    return (
        < div className="script" >
            <div className="script__description">{script.getDescription()}</div>
            <div className="script__verificationState">{verificationState.toString()}</div>
            <div className="script__actions">
                <button onClick={async () => {
                    await script.revoke();
                    await fetchScripts();
                }} className='script__button'>Revoke</button>
                <button onClick={async () => alert(await script.verify())} className='script__button'>Verify</button>

                {
                    verificationState === VerificationState.valid
                        ? <button onClick={async () => alert(await script.execute())} className='script__button'>Execute</button>
                        : verificationState === VerificationState.allowanceNeeded
                            ? <button onClick={async () => alert(await script.execute())} className='script__button'>Require Allowance</button>
                            : null
                }
            </div>
            <button onClick={() => alert(JSON.stringify(script.getMessage(), null, ' '))} className='script__info-button'>i</button>
        </div >
    );
};
