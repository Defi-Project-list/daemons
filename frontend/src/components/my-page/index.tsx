import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import { DisconnectedPage } from '../error-pages/disconnected-page';
import { UnsupportedChainPage } from '../error-pages/unsupported-chain-page';
import { UserScriptsContainer } from './user-scripts';
import { GasTank } from './gas-tank';
import './styles.css';
import '../shared.css';
import { History } from './history';


export function MyPage(): JSX.Element {
    const authenticated: boolean = useSelector((state: RootState) => state.wallet.authenticated);
    const supportedChain: boolean = useSelector((state: RootState) => state.wallet.supportedChain);

    if (!authenticated) return <DisconnectedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className='my-page'>
            <div className='title'>My Page</div>

            <div className='my-page__layout'>
                <div className='my-page__left-panel'>
                    <UserScriptsContainer />
                </div>
                <div className='my-page__right-panel'>
                    <GasTank />
                    <History />
                </div>
            </div>
        </div>
    );
}