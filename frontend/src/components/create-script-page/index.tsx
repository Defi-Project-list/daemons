import React, { Component, ReactNode } from 'react';
import { ComparisonType } from '../../messages/condition-messages';
import { DaoAction } from './blocks/actions/daoAction';
import { FarmAction } from './blocks/actions/farmAction';
import { SwapAction } from './blocks/actions/swapAction';
import { BalanceCondition } from './blocks/conditions/balanceCondition';
import { IBalanceConditionForm, IFrequencyConditionForm, FrequencyUnits } from './blocks/conditions/conditions-interfaces';
import { FrequencyCondition } from './blocks/conditions/frequencyCondition';

import './styles.css';

export enum ScriptAction {
    None,
    Swap,
    Dao,
    Farm,
}

interface ICreateScriptState {
    frequencyCondition: IFrequencyConditionForm;
    balanceCondition: IBalanceConditionForm;
    action: ScriptAction;
}

export class CreateScripts extends Component<any, ICreateScriptState> {

    state: ICreateScriptState = {
        frequencyCondition: { valid: true, enabled: false, ticks: 1, unit: FrequencyUnits.Hours, startNow: true },
        balanceCondition: { valid: true, enabled: false, comparison: ComparisonType.GreaterThan, floatAmount: 0 },
        action: ScriptAction.None,
    };

    private toggleFrequencyCondition = () => { this.setState({ frequencyCondition: { ...this.state.frequencyCondition, enabled: !this.state.frequencyCondition.enabled } }); };
    private toggleBalanceCondition = () => { this.setState({ balanceCondition: { ...this.state.balanceCondition, enabled: !this.state.balanceCondition.enabled } }); };
    private setFarmActionAsSelected = () => { this.setState({ action: ScriptAction.Farm }); };
    private setSwapActionAsSelected = () => { this.setState({ action: ScriptAction.Swap }); };
    private setDaoActionAsSelected = () => { this.setState({ action: ScriptAction.Dao }); };

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
                    {/* <div onClick={this.setFarmActionAsSelected}>
                        <FarmAction selected={this.state.action === ScriptAction.Farm} />
                    </div>
                    <div onClick={this.setSwapActionAsSelected}>
                        <SwapAction selected={this.state.action === ScriptAction.Swap} />
                    </div>
                    <div onClick={this.setDaoActionAsSelected}>
                        <DaoAction selected={this.state.action === ScriptAction.Dao} />
                    </div> */}
                </div>

            </div >
        );
    }

}
