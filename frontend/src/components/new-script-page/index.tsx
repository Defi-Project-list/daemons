import React, { Component, ReactNode } from 'react';
import { ComparisonType, IBalanceCondition, IFrequencyCondition } from '../../../../messages/definitions/condition-messages';
import { INewScriptBundle } from './i-new-script-form';
import { ScriptFactory } from './script-factory';
import { DisconnectedPage } from '../disconnected-page';
import { RootState } from '../../state';
import { connect } from 'react-redux';
import { ConditionBlock } from './blocks/conditions/conditionBlock';
import { FrequencyCondition } from './blocks/conditions/frequencyCondition';
import { FrequencyUnits, IFollowConditionForm, IPriceConditionForm, IRepetitionsConditionForm } from './blocks/conditions/conditions-interfaces';
import { IBalanceConditionForm, IFrequencyConditionForm } from './blocks/conditions/conditions-interfaces';
import { BalanceCondition } from './blocks/conditions/balanceCondition';
import { PriceCondition } from './blocks/conditions/priceCondition';
import { RepetitionsCondition } from './blocks/conditions/repetitionsCondition';
import { FollowCondition } from './blocks/conditions/followCondition';
import { INoActionForm, ISwapActionForm, ITransferActionForm, ScriptAction } from './blocks/actions/actions-interfaces';
import { ActionBlock } from './blocks/actions/actionBlock';
import { TransferAction } from './blocks/actions/transferAction';
import { SwapAction } from './blocks/actions/swapAction';
import { StorageProxy } from '../../data/storage-proxy';
import './styles.css';


interface INewScriptsComponentsProps {
    walletConnected: boolean;
    walletAddress?: string;
    chainId?: string;
}

const noActionForm: INoActionForm = { action: ScriptAction.None, valid: false };
const transferActionForm: ITransferActionForm = { action: ScriptAction.Transfer, valid: false, tokenAddress: '', destinationAddress: '', floatAmount: 0 };
const swapActionForm: ISwapActionForm = { action: ScriptAction.Swap, valid: false, tokenFromAddress: '', tokenToAddress: '', floatAmount: 0 };

class NewScripts extends Component<INewScriptsComponentsProps, INewScriptBundle> {

    state: INewScriptBundle = {
        frequencyCondition: { valid: true, enabled: false, ticks: 1, unit: FrequencyUnits.Hours, startNow: true },
        balanceCondition: { valid: false, enabled: false, comparison: ComparisonType.GreaterThan, floatAmount: 0 },
        priceCondition: { valid: false, enabled: false, comparison: ComparisonType.GreaterThan, floatValue: 0 },
        repetitionsCondition: { valid: false, enabled: false, amount: 0 },
        followCondition: { valid: false, enabled: false },
        actionForm: noActionForm,
    };

    private toggleFrequencyCondition = () => { this.setState({ frequencyCondition: { ...this.state.frequencyCondition, enabled: !this.state.frequencyCondition.enabled } }); };
    private updateFrequencyCondition = (next: IFrequencyConditionForm) => { this.setState({ frequencyCondition: next }); };
    private toggleBalanceCondition = () => { this.setState({ balanceCondition: { ...this.state.balanceCondition, enabled: !this.state.balanceCondition.enabled } }); };
    private updateBalanceCondition = (next: IBalanceConditionForm) => { this.setState({ balanceCondition: next }); };
    private togglePriceCondition = () => { this.setState({ priceCondition: { ...this.state.priceCondition, enabled: !this.state.priceCondition.enabled } }); };
    private updatePriceCondition = (next: IPriceConditionForm) => { this.setState({ priceCondition: next }); };
    private toggleRepetitionsCondition = () => { this.setState({ repetitionsCondition: { ...this.state.repetitionsCondition, enabled: !this.state.repetitionsCondition.enabled } }); };
    private updateRepetitionsCondition = (next: IRepetitionsConditionForm) => { this.setState({ repetitionsCondition: next }); };
    private toggleFollowCondition = () => { this.setState({ followCondition: { ...this.state.followCondition, enabled: !this.state.followCondition.enabled } }); };
    private updateFollowCondition = (next: IFollowConditionForm) => { this.setState({ followCondition: next }); };

    private setTransferActionAsSelected = () => { if (this.state.actionForm.action !== ScriptAction.Transfer) this.setState({ actionForm: transferActionForm }); };
    private updateTransferAction = (next: ITransferActionForm) => { this.setState({ actionForm: next }); };
    private setSwapActionAsSelected = () => { if (this.state.actionForm.action !== ScriptAction.Swap) this.setState({ actionForm: swapActionForm }); };
    private updateSwapAction = (next: ISwapActionForm) => { this.setState({ actionForm: next }); };

    private async createAndSignScript() {
        if (!this.props.chainId) throw new Error("Cannot create the script! The chain is unknown");

        const scriptFactory = await ScriptFactory.build(this.props.chainId);
        const script = await scriptFactory.SubmitScriptsForSignature(this.state);
        await StorageProxy.saveScript(script);
        console.log(this.props.chainId, this.props.walletAddress);
    }

    public render(): ReactNode {
        if (!this.props.walletConnected) return <DisconnectedPage />;
        return (
            <div className="new-script">

                {/* Condition Block */}
                <div className="new-script__step new-script__step--condition">
                    <div className="new-script__block-title">Condition</div>

                    <ConditionBlock
                        title="Frequency"
                        enabled={this.state.frequencyCondition.enabled}
                        toggleEnabled={this.toggleFrequencyCondition}
                    >
                        <FrequencyCondition form={this.state.frequencyCondition} update={this.updateFrequencyCondition} />
                    </ConditionBlock>

                    <ConditionBlock
                        title="Balance"
                        enabled={this.state.balanceCondition.enabled}
                        toggleEnabled={this.toggleBalanceCondition}
                    >
                        <BalanceCondition form={this.state.balanceCondition} update={this.updateBalanceCondition} />
                    </ConditionBlock>

                    <ConditionBlock
                        title="Price"
                        enabled={this.state.priceCondition.enabled}
                        toggleEnabled={this.togglePriceCondition}
                    >
                        <PriceCondition form={this.state.priceCondition} update={this.updatePriceCondition} />
                    </ConditionBlock>

                    <ConditionBlock
                        title="Repetitions"
                        enabled={this.state.repetitionsCondition.enabled}
                        toggleEnabled={this.toggleRepetitionsCondition}
                    >
                        <RepetitionsCondition form={this.state.repetitionsCondition} update={this.updateRepetitionsCondition} />
                    </ConditionBlock>

                    <ConditionBlock
                        title="Execute After"
                        enabled={this.state.followCondition.enabled}
                        toggleEnabled={this.toggleFollowCondition}
                    >
                        <FollowCondition form={this.state.followCondition} update={this.updateFollowCondition} />
                    </ConditionBlock>

                </div>

                {/* Separator */}
                <div className='new-script__arrow'>▶</div>

                {/* Action Block */}
                <div className="new-script__step">
                    <div className="new-script__block-title">Action</div>

                    <ActionBlock
                        title="Transfer"
                        enabled={this.state.actionForm.action === ScriptAction.Transfer}
                        toggleEnabled={this.setTransferActionAsSelected}
                    >
                        <TransferAction form={this.state.actionForm as ITransferActionForm} update={this.updateTransferAction} />
                    </ActionBlock>

                    <ActionBlock
                        title="Swap"
                        enabled={this.state.actionForm.action === ScriptAction.Swap}
                        toggleEnabled={this.setSwapActionAsSelected}
                    >
                        <SwapAction form={this.state.actionForm as ISwapActionForm} update={this.updateSwapAction} />
                    </ActionBlock>

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
                <pre>{JSON.stringify(this.state, null, ' ')}</pre>
            </div >
        );
    }

}

const mapStateToProps: (state: RootState) => INewScriptsComponentsProps = state => ({
    walletConnected: state.wallet.connected,
    walletAddress: state.wallet.address,
    chainId: state.wallet.chainId,
});

export default connect(mapStateToProps)(NewScripts);
