import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BaseScript } from '../../data/script/base-script';
import { RootState } from '../../state';
import { fetchAllScripts, toggleScriptsLoading } from '../../state/action-creators/script-action-creators';
import { QueueScriptComponent } from './executable-script';
import './styles.css';


export function ExecutableScriptsContainer() {
    const dispatch = useDispatch();
    const walletChainId = useSelector((state: RootState) => state.wallet.chainId);
    const fetchedScripts = useSelector((state: RootState) => state.script.allScripts);
    const loading = useSelector((state: RootState) => state.script.loading);

    useEffect(() => {
        dispatch(toggleScriptsLoading());
        dispatch(fetchAllScripts(walletChainId));
    }, [walletChainId]);

    const reloadScripts = async () => {
        dispatch(toggleScriptsLoading());
        dispatch(fetchAllScripts(walletChainId));
    };

    const scripts = fetchedScripts.map((script: BaseScript) => (
        <QueueScriptComponent key={script.getId()} script={script} />
    ));
    return (
        <div className='card'>
            <div className='card__header'>
                <div className='card__title'>Executable Scripts</div>
                <div className={'queue-container__reload-bt ' + (loading ? 'queue-container__reload-bt--loading' : '')}
                    onClick={reloadScripts}
                />
            </div>
            <div className='card__subtitle'>Execute scripts and get rewarded in DAEM tokens</div>

            <div className="queue-container">
                {scripts}
            </div>
        </div>
    );
}
