import React, { Component, ReactNode } from 'react';
import { SelectableBlock } from '../baseBlock';
import { IDAOActionForm } from './actions-interfaces';


export class DaoAction extends SelectableBlock<IDAOActionForm> {

    protected title: string = "DAOs";
    protected content = () => {
        return (
            <div className='dao-block'>
                <select className='dao-block__dao'>
                    <option selected id='dao-option-olympus'>Olympus</option>
                    <option id='dao-option-wonderland'>Wonderland</option>
                    <option id='dao-option-rome'>Rome</option>
                    <option id='dao-option-redacted'>Redacted</option>
                </select>

                <select className='dao-block__action'>
                    <option selected id='dao-action-option-claim-and-stake'>Claim and Stake</option> {/* Should show available bonds on another select */}
                    <option id='dao-action-option-claim'>Claim</option> {/* Should show available bonds on another select */}
                    <option id='dao-action-option-unstake'>Unstake</option> {/* Should show range */}
                    <option id='dao-action-option-unstake'>Stake</option> {/* Should show range */}
                </select>
            </div>
        );
    };
}
