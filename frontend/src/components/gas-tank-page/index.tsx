import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Contracts } from '../../data/contracts';
import { getAbiFor } from '../../utils/get-abi';
import { RootState } from '../../state';
import { fetchGasTankBalance } from '../../state/action-creators/gas-tank-action-creators';
import './styles.css';

interface IGasTankComponentsProps {
    fetchGasTankBalance: (address: string) => any;
    balance: number | null;
    walletAddress: string | null;
}

class GasTank extends Component<IGasTankComponentsProps> {
    componentDidMount() {
        if (this.props.walletAddress) {
            this.props.fetchGasTankBalance(this.props.walletAddress);
        }
    }

    componentDidUpdate(prevProps: IGasTankComponentsProps) {
        // recheck balance in case the wallet address has changed
        if (prevProps.walletAddress !== this.props.walletAddress && this.props.walletAddress) {
            this.props.fetchGasTankBalance(this.props.walletAddress);
        }
    }

    getGasTankContract = async () => {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = Contracts.GasTank;
        const contractAbi = await getAbiFor('GasTank');
        const gasTank = new ethers.Contract(contractAddress, contractAbi, signer);
        return gasTank;
    };

    deposit = async (amount: number) => {
        const ethers = require('ethers');
        const gasTank = await this.getGasTankContract();

        const tx = await gasTank.deposit({ value: ethers.utils.parseEther(amount.toString()) });
        await tx.wait();

        this.props.fetchGasTankBalance(this.props.walletAddress!);
    };

    withdraw = async (amount: number) => {
        const ethers = require('ethers');
        const gasTank = await this.getGasTankContract();

        const tx = await gasTank.withdraw(ethers.utils.parseEther(amount.toString()));
        await tx.wait();

        this.props.fetchGasTankBalance(this.props.walletAddress!);
    };

    withdrawAll = async () => {
        const gasTank = await this.getGasTankContract();

        const tx = await gasTank.withdrawAll();
        await tx.wait();

        this.props.fetchGasTankBalance(this.props.walletAddress!);
    };

    public render(): ReactNode {
        return (
            <div>
                <div>Gas Tank</div>
                <div className="gas-tank">
                    {
                        this.props.balance !== null && this.props.walletAddress !== null
                            ? <div>
                                <div>Balance: {this.props.balance}</div>
                                <button onClick={() => this.deposit(1)}> Deposit 1Eth</button>
                                <button onClick={() => this.withdraw(1)}> Withdraw 1Eth</button>
                                <button onClick={() => this.withdrawAll()}> Withdraw All</button>
                            </div>
                            : <div>Loading...</div>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps: (state: RootState) => IGasTankComponentsProps = state => ({
    fetchGasTankBalance: fetchGasTankBalance,
    balance: state.gasTank.balance,
    walletAddress: state.wallet,
});

export default connect(mapStateToProps, { fetchGasTankBalance })(GasTank);
