import React, { Component, ReactNode } from 'react';
import { SelectableBlock } from '../baseBlock';


export class FrequencyCondition extends SelectableBlock {

    protected title: string = "Frequency";
    protected content = () => {
        return (
            <div className='frequency-block'>
                <input type="text" className='frequency-block__amount' placeholder='1'></input>

                <select className='frequency-block__time-unit'>
                    <option id='frequency-option-minutes'>Seconds</option>
                    <option id='frequency-option-minutes'>Minutes</option>
                    <option selected id='frequency-option-hours'>Hours</option>
                    <option id='frequency-option-days'>Days</option>
                    <option id='frequency-option-weeks'>Weeks</option>
                    <option id='frequency-option-months'>Months</option>
                </select>

            </div >
        );
    };
}
