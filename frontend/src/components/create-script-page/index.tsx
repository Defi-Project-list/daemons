import React, { Component, ReactNode } from 'react';
import { ComparisonType } from '../../../../messages/definitions/condition-messages';
import { IDAOActionForm, IFarmActionForm, INoActionForm, ISwapActionForm, ITransferActionForm, ScriptAction } from './blocks/actions/actions-interfaces';
import { DaoAction } from './blocks/actions/daoAction';
import { FarmAction } from './blocks/actions/farmAction';
import { SwapAction } from './blocks/actions/swapAction';
import { TransferAction } from './blocks/actions/transferAction';
import { BalanceCondition } from './blocks/conditions/balanceCondition';
import { FrequencyUnits } from './blocks/conditions/conditions-interfaces';
import { FrequencyCondition } from './blocks/conditions/frequencyCondition';
import { PriceCondition } from './blocks/conditions/priceCondition';
import { ICreateScriptBundle } from './i-create-script-form';
import { ScriptFactory } from './script-factory';
import { StorageProxy } from '../../data/storage-proxy';
import { DisconnectedPage } from '../disconnected-page';
import { RootState } from '../../state';
import { connect } from 'react-redux';

import './styles.css';
import { RepetitionsCondition } from './blocks/conditions/repetitionsCondition';

interface ICreateScriptsComponentsProps {
    walletConnected: boolean;
    chainId?: string;
}

const noActionForm: INoActionForm = { action: ScriptAction.None, valid: false };
const swapActionForm: ISwapActionForm = { action: ScriptAction.Swap, valid: false, tokenFromAddress: '', tokenToAddress: '', floatAmount: 0 };
const transferActionForm: ITransferActionForm = { action: ScriptAction.Transfer, valid: false, tokenAddress: '', destinationAddress: '', floatAmount: 0 };
const daoActionForm: IDAOActionForm = { action: ScriptAction.Dao, valid: false };
const farmActionForm: IFarmActionForm = { action: ScriptAction.Farm, valid: false };

class CreateScripts extends Component<ICreateScriptsComponentsProps, ICreateScriptBundle> {

    state: ICreateScriptBundle = {
        frequencyCondition: { valid: true, enabled: false, ticks: 1, unit: FrequencyUnits.Hours, startNow: true },
        balanceCondition: { valid: false, enabled: false, comparison: ComparisonType.GreaterThan, floatAmount: 0 },
        priceCondition: { valid: false, enabled: false, comparison: ComparisonType.GreaterThan, floatValue: 0 },
        repetitionsCondition: { valid: false, enabled: false, amount: 0 },
        actionForm: noActionForm,
        loading: true
    };

    private toggleFrequencyCondition = () => { this.setState({ frequencyCondition: { ...this.state.frequencyCondition, enabled: !this.state.frequencyCondition.enabled } }); };
    private toggleBalanceCondition = () => { this.setState({ balanceCondition: { ...this.state.balanceCondition, enabled: !this.state.balanceCondition.enabled } }); };
    private togglePriceCondition = () => { this.setState({ priceCondition: { ...this.state.priceCondition, enabled: !this.state.priceCondition.enabled } }); };
    private toggleRepetitionsCondition = () => { this.setState({ repetitionsCondition: { ...this.state.repetitionsCondition, enabled: !this.state.repetitionsCondition.enabled } }); };

    private setSwapActionAsSelected = () => { this.setState({ actionForm: swapActionForm }); };
    private setTransferActionAsSelected = () => { this.setState({ actionForm: transferActionForm }); };
    private setFarmActionAsSelected = () => { this.setState({ actionForm: farmActionForm }); };
    private setDaoActionAsSelected = () => { this.setState({ actionForm: daoActionForm }); };

    async componentDidMount() {
        await this.setCacheTokens();
    }

    async componentDidUpdate(prevProps: ICreateScriptsComponentsProps) {
        if (this.props.chainId !== prevProps.chainId) {
            await this.setCacheTokens();
        }
    }

    private async setCacheTokens() {
        const tokens = await StorageProxy.fetchTokens(this.props.chainId);
        if (tokens.length > 0) {
            this.setState({ loading: false });
        }
    }

    private async createAndSignScript() {
        if (!this.props.chainId) throw new Error("Cannot create the script! The chain is unknown");

        const scriptFactory = await ScriptFactory.build(this.props.chainId);
        const script = await scriptFactory.SubmitScriptsForSignature(this.state);
        StorageProxy.saveScript(script);
    }

    public render(): ReactNode {
        if (!this.props.walletConnected) return <DisconnectedPage />;

        if (this.state.loading) return <div>Loading...</div>;

        return (
            <div className="new-script">

                {/* Condition Block */}
                <div className="new-script__step new-script__step--condition">
                    <div className="new-script__block-title">Initial Condition</div>
                    <div onClick={this.toggleFrequencyCondition}>
                        <FrequencyCondition selected={this.state.frequencyCondition.enabled}
                            showSelectionCheckbox={true}
                            blockForm={this.state.frequencyCondition}
                        />
                    </div>
                    <div onClick={this.toggleBalanceCondition}>
                        <BalanceCondition selected={this.state.balanceCondition.enabled}
                            showSelectionCheckbox={true}
                            blockForm={this.state.balanceCondition}
                            chainId={this.props.chainId}
                        />
                    </div>
                    <div onClick={this.togglePriceCondition}>
                        <PriceCondition selected={this.state.priceCondition.enabled}
                            showSelectionCheckbox={true}
                            blockForm={this.state.priceCondition}
                            chainId={this.props.chainId}
                        />
                    </div>
                    <div onClick={this.toggleRepetitionsCondition}>
                        <RepetitionsCondition selected={this.state.repetitionsCondition.enabled}
                            showSelectionCheckbox={true}
                            blockForm={this.state.repetitionsCondition}
                        />
                    </div>
                </div>

                {/* Separator */}
                <div className='new-script__arrow'>▶</div>

                {/* Action Block */}
                <div className="new-script__step">
                    <div className="new-script__block-title">Action</div>
                    <div onClick={this.setSwapActionAsSelected}>
                        <SwapAction
                            selected={this.state.actionForm.action === ScriptAction.Swap}
                            blockForm={swapActionForm}
                            chainId={this.props.chainId}
                        />
                    </div>
                    <div onClick={this.setTransferActionAsSelected}>
                        <TransferAction
                            selected={this.state.actionForm.action === ScriptAction.Transfer}
                            blockForm={transferActionForm}
                            chainId={this.props.chainId}
                        />
                    </div>
                    {/* <div onClick={this.setFarmActionAsSelected}>
                        <FarmAction
                            selected={this.state.actionForm.action === ScriptAction.Farm}
                            blockForm={farmActionForm}
                        />
                    </div>
                    <div onClick={this.setDaoActionAsSelected}>
                        <DaoAction
                            selected={this.state.actionForm.action === ScriptAction.Dao}
                            blockForm={daoActionForm}
                        />
                    </div> */}
                </div>

                <button
                    className="new-script__button"
                    disabled={
                        !this.state.actionForm.valid
                        || (this.state.balanceCondition.enabled && !this.state.balanceCondition.valid)
                        || (this.state.frequencyCondition.enabled && !this.state.frequencyCondition.valid)
                        || (this.state.priceCondition.enabled && !this.state.priceCondition.valid)
                        || (this.state.repetitionsCondition.enabled && !this.state.repetitionsCondition.valid)
                    }
                    onClick={async () => this.createAndSignScript()}
                >
                    {"Sign & Deploy"}
                </button>

            </div >
        );
    }

}

const mapStateToProps: (state: RootState) => ICreateScriptsComponentsProps = state => ({
    walletConnected: state.wallet.connected,
    chainId: state.wallet.chainId,
});

export default connect(mapStateToProps)(CreateScripts);
