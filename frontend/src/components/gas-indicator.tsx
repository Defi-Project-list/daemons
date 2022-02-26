import React from 'react';
import { useSelector } from 'react-redux';
import { GetCurrentChain } from '../data/chain-info';
import { RootState } from '../state';


export function GasIndicator(): JSX.Element {
    const balance = useSelector((state: RootState) => state.gasTank.balance);
    const walletConnected = useSelector((state: RootState) => state.wallet.connected);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);

    const showBalance = balance !== undefined && walletConnected;
    const currencySymbol = chainId !== undefined ? GetCurrentChain(chainId).coinSymbol : 'ETH';

    return <div>Gas: {showBalance ? balance : '??'} {currencySymbol}</div>;
}
