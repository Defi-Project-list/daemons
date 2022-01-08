import React, { Component, ReactNode } from 'react';
import { SelectableBlock } from '../baseBlock';
import { IBalanceConditionForm } from './conditions-interfaces';


export class BalanceCondition extends SelectableBlock<IBalanceConditionForm> {

    protected title: string = "Wallet Balance";
    protected content = () => {
        return (
            <div className='balance-block'>
                <select className='balance-block__token'>
                    <option selected id='comparison-option-greater-than'>MATIC</option>
                    <option id='comparison-option-greater-than'>USDC</option>
                    <option id='comparison-option-greater-than'>USDT</option>
                    <option id='comparison-option-greater-than'>DAI</option>
                </select>

                <select className='balance-block__comparison'>
                    <option selected id='comparison-option-greater-than'>&gt;</option>
                    <option id='comparison-option-less-than'>&lt;</option>
                </select>

                <input type="text" className='balance-block__amount' placeholder='1.00'></input>
            </div>
        );
    };
}
