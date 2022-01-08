import React, { Component, ReactNode } from 'react';
import { ComparisonType } from '../../messages/condition-messages';
import { IDAOActionForm, IFarmActionForm, INoActionForm, ISwapActionForm, ScriptAction, IScriptActionForm } from './blocks/actions/actions-interfaces';
import { DaoAction } from './blocks/actions/daoAction';
import { FarmAction } from './blocks/actions/farmAction';
import { SwapAction } from './blocks/actions/swapAction';
import { BalanceCondition } from './blocks/conditions/balanceCondition';
import { IBalanceConditionForm, IFrequencyConditionForm, FrequencyUnits } from './blocks/conditions/conditions-interfaces';
import { FrequencyCondition } from './blocks/conditions/frequencyCondition';
import { ICreateScriptBundle } from './i-create-script-form';
import { ScriptFactory } from './script-factory';

import './styles.css';


const noActionForm: INoActionForm = { action: ScriptAction.None, valid: false };
const swapActionForm: ISwapActionForm = { action: ScriptAction.Swap, valid: false, tokenFromAddress: '', tokenToAddress: '', floatAmount: 0 };
const daoActionForm: IDAOActionForm = { action: ScriptAction.Dao, valid: false };
const farmActionForm: IFarmActionForm = { action: ScriptAction.Farm, valid: false };

export class CreateScripts extends Component<any, ICreateScriptBundle> {

    state: ICreateScriptBundle = {
        frequencyCondition: { valid: true, enabled: false, ticks: 1, unit: FrequencyUnits.Hours, startNow: true },
        balanceCondition: { valid: false, enabled: false, comparison: ComparisonType.GreaterThan, floatAmount: 0 },
        actionForm: noActionForm
    };

    private toggleFrequencyCondition = () => { this.setState({ frequencyCondition: { ...this.state.frequencyCondition, enabled: !this.state.frequencyCondition.enabled } }); };
    private toggleBalanceCondition = () => { this.setState({ balanceCondition: { ...this.state.balanceCondition, enabled: !this.state.balanceCondition.enabled } }); };
    private setFarmActionAsSelected = () => { this.setState({ actionForm: farmActionForm }); };
    private setSwapActionAsSelected = () => { this.setState({ actionForm: swapActionForm }); };
    private setDaoActionAsSelected = () => { this.setState({ actionForm: daoActionForm }); };

    private async createAndSignScript() {
        const signature = await new ScriptFactory().SubmitScriptsForSignature(this.state);
        alert(signature);
    }

    public render(): ReactNode {
        return (
            <div className="new-script">

                {/* Condition Block */}
                <div className="new-script__step">
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
                        />
                    </div>
                    <div onClick={this.setFarmActionAsSelected}>
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
                    </div>
                </div>

                <button
                    disabled={
                        !this.state.actionForm.valid
                        || (this.state.balanceCondition.enabled && !this.state.balanceCondition.valid)
                        || (this.state.frequencyCondition.enabled && !this.state.frequencyCondition.valid)
                    }
                    onClick={async () => this.createAndSignScript()}
                >
                    YAY
                </button>

            </div >
        );
    }

}
