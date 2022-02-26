import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import { DisconnectedPage } from '../error-pages/disconnected-page';
import { UnsupportedChainPage } from '../error-pages/unsupported-chain-page';
import { ExecutableScriptsContainer } from './executable-scripts';
import './styles.css';


export function ExecutePage() {
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    if (!authenticated) return <DisconnectedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className='execute-page'>
            <div className='title'>Execute</div>

            <div className='execute-page__layout'>
                <div className='execute-page__left-panel'>
                    <ExecutableScriptsContainer />
                </div>
                <div className='execute-page__right-panel'>
                    <div className='card'><div className='card__title'>Profits</div>Getting there...</div>
                    <div className='card'><div className='card__title'>Stake</div>Getting there...</div>
                    <div className='card'><div className='card__title'>APY</div>Getting there...</div>
                </div>
            </div>
        </div>
    );
}
