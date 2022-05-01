import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BaseScript } from '@daemons-fi/scripts-definitions';
import { RootState } from '../../state';
import { fetchAllScripts, toggleScriptsLoading } from '../../state/action-creators/script-action-creators';
import { QueueScriptComponent } from './executable-script';
import './styles.css';


export function ExecutableScriptsContainer() {
    const dispatch = useDispatch();
    const walletChainId = useSelector((state: RootState) => state.wallet.chainId);
    const fetchedScripts = useSelector((state: RootState) => state.script.allScripts);
    const loading = useSelector((state: RootState) => state.script.loading);

    const reloadScripts = async () => {
        dispatch(toggleScriptsLoading());
        dispatch(fetchAllScripts(walletChainId));
    };

    useEffect(() => {
        if (fetchedScripts.length === 0) {
            reloadScripts();
        }
    }, [walletChainId]);


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
