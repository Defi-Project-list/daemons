import React, { Component, ReactNode } from 'react';
import { SelectableBlock } from '../baseBlock';


export class SwapAction extends SelectableBlock {

    protected title: string = "Swap";
    protected content = () => {
        return (
            <div className='swap-block'>
                <select className='swap-block__token-1'>
                    <option selected id='0x1'>MATIC</option>
                    <option id='0x2'>USDC</option>
                    <option id='0x3'>USDT</option>
                    <option id='0x4'>DAI</option>
                </select>

                <select className='swap-block__token-2'>
                    <option id='0x1'>MATIC</option>
                    <option selected id='0x2'>USDC</option>
                    <option id='0x3'>USDT</option>
                    <option id='0x4'>DAI</option>
                </select>

                <input type="range" min="1" max="100" className='swap-block__percentage' />
            </div>
        );
    };
}
