import React, { Component, ReactNode } from 'react';
import { DaoAction } from './blocks/actions/daoAction';
import { FarmAction } from './blocks/actions/farmAction';
import { SwapAction } from './blocks/actions/swapAction';
import { BalanceCondition } from './blocks/conditions/balanceCondition';
import { FrequencyCondition } from './blocks/conditions/frequencyCondition';

import './styles.css';

/** The selected condition to create a new script */
export enum ScriptCondition {
    None,
    Frequency,
    WalletBalance,
}

export enum ScriptAction {
    None,
    Swap,
    Dao,
    Farm,
}

interface ICreateScriptState {
    condition: ScriptCondition;
    action: ScriptAction;
}

export class CreateScripts extends Component<any, ICreateScriptState> {

    state: ICreateScriptState = {
        condition: ScriptCondition.None,
        action: ScriptAction.None,
    };

    private setFrequencyConditionAsSelected = () => { this.setState({ condition: ScriptCondition.Frequency }); };
    private setBalanceConditionAsSelected = () => { this.setState({ condition: ScriptCondition.WalletBalance }); };
    private setFarmActionAsSelected = () => { this.setState({ action: ScriptAction.Farm }); };
    private setSwapActionAsSelected = () => { this.setState({ action: ScriptAction.Swap }); };
    private setDaoActionAsSelected = () => { this.setState({ action: ScriptAction.Dao }); };

    public render(): ReactNode {
        return (
            <div className="new-script">

                {/* Condition Block */}
                <div className="new-script__step">
                    <div className="new-script__block-title">Initial Condition</div>
                    <div onClick={this.setFrequencyConditionAsSelected}>
                        <FrequencyCondition selected={this.state.condition === ScriptCondition.Frequency} />
                    </div>
                    <div onClick={this.setBalanceConditionAsSelected}>
                        <BalanceCondition selected={this.state.condition === ScriptCondition.WalletBalance} />
                    </div>
                </div>

                {/* Separator */}
                <div className='new-script__arrow'>▶</div>

                {/* Action Block */}
                <div className="new-script__step">
                    <div className="new-script__block-title">Action</div>
                    <div onClick={this.setFarmActionAsSelected}>
                        <FarmAction selected={this.state.action === ScriptAction.Farm} />
                    </div>
                    <div onClick={this.setSwapActionAsSelected}>
                        <SwapAction selected={this.state.action === ScriptAction.Swap} />
                    </div>
                    <div onClick={this.setDaoActionAsSelected}>
                        <DaoAction selected={this.state.action === ScriptAction.Dao} />
                    </div>
                </div>

            </div >
        );
    }

}
