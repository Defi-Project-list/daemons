import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { fetchGasTankBalance } from '../state/action-creators/gas-tank-action-creators';
import { RootState } from '../state';

interface IGasIndicatorProps {
    fetchGasTankBalance: (address?: string) => any;
    balance?: number;
    walletConnected: boolean;
    walletAddress?: string;
    walletChainId?: string;
}

class GasIndicator extends Component<IGasIndicatorProps> {

    private connectionStatusChanged = (prevProps: IGasIndicatorProps) => prevProps.walletConnected != this.props.walletConnected;
    private walletChanged = (prevProps: IGasIndicatorProps) => prevProps.walletAddress != this.props.walletAddress;
    private chainChanged = (prevProps: IGasIndicatorProps) => prevProps.walletChainId != this.props.walletChainId;

    public componentDidMount() {
        if (this.props.walletAddress) {
            this.props.fetchGasTankBalance(this.props.walletAddress);
        }
    }

    public componentDidUpdate(prevProps: IGasIndicatorProps) {
        if (this.connectionStatusChanged(prevProps) || this.walletChanged(prevProps) || this.chainChanged(prevProps)) {
            this.props.fetchGasTankBalance(this.props.walletAddress);
        }

        // recheck balance in case the wallet address has changed
        // TODO: recheck also when chain and connection status change!
        if (prevProps.walletAddress !== this.props.walletAddress && this.props.walletAddress) {
            this.props.fetchGasTankBalance(this.props.walletAddress);
        }
    }

    public render(): ReactNode {
        return <div>Gas: {this.props.balance != undefined && this.props.walletConnected ? this.props.balance : '??'} ETH</div>;
    }
}

const mapStateToProps: (state: RootState) => IGasIndicatorProps = state => ({
    fetchGasTankBalance: fetchGasTankBalance,
    balance: state.gasTank.balance,
    walletConnected: state.wallet.connected,
    walletAddress: state.wallet.address,
    walletChainId: state.wallet.chainId,
});

export default connect(mapStateToProps, { fetchGasTankBalance })(GasIndicator);
