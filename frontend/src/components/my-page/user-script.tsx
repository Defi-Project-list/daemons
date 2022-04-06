import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BaseScript, VerificationState } from '../../data/script/base-script';
import { RootState } from '../../state';
import { fetchGasTankClaimable } from '../../state/action-creators/gas-tank-action-creators';
import { removeScript } from '../../state/action-creators/script-action-creators';


export const MyPageScript = ({ script }: { script: BaseScript; }) => {
    const [verificationState, setVerificationState] = useState(script.getVerificationState());
    const dispatch = useDispatch();
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);

    const revokeScript = async () => { await script.revoke(); dispatch(removeScript(script)); };
    const verifyScript = async () => { setVerificationState(await script.verify()); };
    const executeScript = async () => { await script.execute(); dispatch(fetchGasTankClaimable(walletAddress, chainId)); };
    const requestAllowance = async () => { await script.requestAllowance(); await verifyScript(); };

    if (verificationState === VerificationState.unverified) {
        verifyScript();
    }

    return (
        < div className="script" >
            <div className="script__description">{script.getDescription()}</div>
            <div className="script__verificationState">{verificationState.toString()}</div>
            <div className="script__actions">
                <button onClick={revokeScript} className='script__button'>Revoke</button>
                <button onClick={verifyScript} className='script__button'>Verify</button>

                {
                    verificationState === VerificationState.valid
                        ? <button onClick={executeScript} className='script__button'>Execute</button>
                        : verificationState === VerificationState.allowanceNeeded
                            ? <button onClick={requestAllowance} className='script__button'>Require Allowance</button>
                            : null
                }
            </div>
            <button onClick={() => alert(JSON.stringify(script.getMessage(), null, ' '))} className='script__info-button'>i</button>
        </div >
    );
};
