import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { fetchGasTankBalance } from '../state/action-creators/gas-tank-action-creators';
import { RootState } from '../state';

interface IGasIndicatorProps {
    fetchGasTankBalance: (address: string) => any;
    balance: number | null;
    walletAddress: string | null;
}

class GasIndicator extends Component<IGasIndicatorProps> {

    public componentDidMount() {
        if (this.props.walletAddress) {
            this.props.fetchGasTankBalance(this.props.walletAddress);
        }
    }

    public componentDidUpdate(prevProps: IGasIndicatorProps) {
        // recheck balance in case the wallet address has changed
        if (prevProps.walletAddress !== this.props.walletAddress && this.props.walletAddress) {
            this.props.fetchGasTankBalance(this.props.walletAddress);
        }
    }

    public render(): ReactNode {
        return <div>Gas: {this.props.balance !== null ? this.props.balance : '??'} ETH</div>;
    }
}

const mapStateToProps: (state: RootState) => IGasIndicatorProps = state => ({
    fetchGasTankBalance: fetchGasTankBalance,
    balance: state.gasTank.balance,
    walletAddress: state.wallet,
});

export default connect(mapStateToProps, { fetchGasTankBalance })(GasIndicator);
