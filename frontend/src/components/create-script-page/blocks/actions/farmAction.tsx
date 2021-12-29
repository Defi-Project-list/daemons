import React, { Component, ReactNode } from 'react';
import { SelectableBlock } from '../baseBlock';


export class FarmAction extends SelectableBlock {

    protected title: string = "Farms";
    protected content = () => {
        return (
            <div className='farms-block'>
                <select className='farms-block__protocol'>
                    <option selected id='dao-option-sushi'>Sushi</option>
                    <option id='dao-option-quickswap'>QuickSwap</option>
                    <option id='dao-option-curve'>Curve</option>
                    <option id='dao-option-polycat'>Polycat</option>
                </select>

                <select className='farms-block__action'>
                    <option selected id='farm-action-option-claim'>Claim</option>
                    <option id='farm-action-option-stake'>Stake</option> {/* Should show range */}
                    <option id='farm-action-option-unstake'>Unstake</option> {/* Should show range */}
                </select>

                <select className='farms-block__pool'>
                    <option selected id='farm-pool-option-1'>USDC-USDT</option>
                    <option id='farm-pool-option-3'>USDC-DAI</option>
                    <option id='farm-pool-option-2'>MATIC-DAI</option>
                </select>
            </div>
        );
    };
}
