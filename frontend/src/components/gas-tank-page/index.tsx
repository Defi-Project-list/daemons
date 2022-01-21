import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Contracts } from '../../data/contracts';
import { getAbiFor } from '../../utils/get-abi';
import { RootState } from '../../state';
import { fetchGasTankBalance } from '../../state/action-creators/gas-tank-action-creators';
import { Field, Form } from 'react-final-form';
import { DisconnectedPage } from '../disconnected-page';
import './styles.css';
import '../switch.css';

interface IGasTankComponentsProps {
    fetchGasTankBalance: (address: string) => any;
    balance?: number;
    walletConnected: boolean;
    walletAddress?: string;
    walletChainId?: string;
}

class GasTank extends Component<IGasTankComponentsProps> {
    state = {
        toggleDeposit: true
    };

    public componentDidMount() {
        if (this.props.walletAddress) {
            this.props.fetchGasTankBalance(this.props.walletAddress);
        }
    }

    public componentDidUpdate(prevProps: IGasTankComponentsProps) {
        // recheck balance in case the wallet address has changed
        // TODO: recheck also when chain and connection status change!
        if (prevProps.walletAddress !== this.props.walletAddress && this.props.walletAddress) {
            this.props.fetchGasTankBalance(this.props.walletAddress);
        }
    }

    private getGasTankContract = async () => {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = Contracts.GasTank;
        const contractAbi = await getAbiFor('GasTank');
        const gasTank = new ethers.Contract(contractAddress, contractAbi, signer);
        return gasTank;
    };

    private deposit = async () => {
        const amount = parseFloat((document.getElementById('id-amount') as HTMLInputElement).value);

        const ethers = require('ethers');
        const gasTank = await this.getGasTankContract();

        const tx = await gasTank.deposit({ value: ethers.utils.parseEther(amount.toString()) });
        await tx.wait();

        this.props.fetchGasTankBalance(this.props.walletAddress!);
        (document.getElementById('id-amount') as HTMLInputElement).value = '';
    };

    private withdraw = async () => {
        const amount = parseFloat((document.getElementById('id-amount') as HTMLInputElement).value);

        const ethers = require('ethers');
        const gasTank = await this.getGasTankContract();

        const tx = await gasTank.withdraw(ethers.utils.parseEther(amount.toString()));
        await tx.wait();

        this.props.fetchGasTankBalance(this.props.walletAddress!);
        (document.getElementById('id-amount') as HTMLInputElement).value = '';
    };

    private withdrawAll = async () => {
        const gasTank = await this.getGasTankContract();

        const tx = await gasTank.withdrawAll();
        await tx.wait();

        this.props.fetchGasTankBalance(this.props.walletAddress!);
        (document.getElementById('id-amount') as HTMLInputElement).value = '';
    };

    public render(): ReactNode {
        if (!this.props.walletConnected) return <DisconnectedPage />;

        return (
            <div className="outer-component">
                <div className="gas-tank">
                    <div className="gas-tank__header">
                        <div className='gas-tank__title'>
                            Gas Tank

                            {/* Deposit/Withdraw switch */}
                            <div className='gas-tank__switch'>
                                Deposit
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        value={String(this.state.toggleDeposit)}
                                        onChange={() => this.setState({ toggleDeposit: !this.state.toggleDeposit })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                                Withdraw
                            </div>

                        </div>
                        <div className="gas-tank__balance">{this.props.balance !== undefined ? this.props.balance : '??'} ETH</div>
                    </div>
                    <div className="gas-tank__forms-container">
                        {
                            this.props.balance === undefined || this.props.walletAddress === undefined
                                ? this.renderLoadingMessage()
                                : (<div>
                                    {/* Deposit/Withdraw forms, depending on the switch position */}
                                    {this.state.toggleDeposit
                                        ? this.renderDepositForm()
                                        : this.renderWithdrawForm()
                                    }
                                </div>
                                )
                        }
                    </div>
                </div>
            </div>
        );
    }

    private renderLoadingMessage: () => ReactNode = () => {
        return (
            <div className='gas-tank__loading'>
                Loading...
            </div>
        );
    };

    private renderDepositForm: () => ReactNode = () => {
        return (
            <Form
                className='gas-tank__form'
                onSubmit={this.deposit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            className='gas-tank__input'
                            id='id-amount'
                            name="amount"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div className='gas-tank__buttons-container'>
                            <input className='gas-tank__button' type="submit" value="Deposit" />
                        </div>
                    </form>
                )}
            />
        );
    };

    private renderWithdrawForm: () => ReactNode = () => {
        return (
            <Form
                className='gas-tank__form'
                onSubmit={() => {/* Handled in the buttons */ }}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field
                            className='gas-tank__input'
                            id='id-amount'
                            name="amount"
                            component="input"
                            type="number"
                            placeholder="0.0"
                        />
                        <div className='gas-tank__buttons-container'>
                            <input className='gas-tank__button' type="submit" onClick={this.withdraw} value="Withdraw" />
                            <input className='gas-tank__button' type="submit" onClick={this.withdrawAll} value="Withdraw All" />
                        </div>
                    </form>
                )}
            />
        );
    };
}

const mapStateToProps: (state: RootState) => IGasTankComponentsProps = state => ({
    fetchGasTankBalance: fetchGasTankBalance,
    balance: state.gasTank.balance,
    walletConnected: state.wallet.connected,
    walletAddress: state.wallet.address,
    walletChainId: state.wallet.chainId,
});

export default connect(mapStateToProps, { fetchGasTankBalance })(GasTank);
