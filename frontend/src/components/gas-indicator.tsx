import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { RootState } from '../state';

interface IGasIndicatorProps {
    balance?: number;
    walletConnected: boolean;
    walletAddress?: string;
    walletChainId?: string;
}

class GasIndicator extends Component<IGasIndicatorProps> {

    public render(): ReactNode {
        return <div>Gas: {this.props.balance != undefined && this.props.walletConnected ? this.props.balance : '??'} ETH</div>;
    }
}

const mapStateToProps: (state: RootState) => IGasIndicatorProps = state => ({
    balance: state.gasTank.balance,
    walletConnected: state.wallet.connected,
    walletAddress: state.wallet.address,
    walletChainId: state.wallet.chainId,
});

export default connect(mapStateToProps)(GasIndicator);
