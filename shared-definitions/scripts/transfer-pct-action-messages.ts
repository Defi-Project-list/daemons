import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance } from './condition-messages';
import { IPriceCondition, Price } from './condition-messages';
import { IFrequencyCondition, Frequency } from './condition-messages';
import { IMaxRepetitionsCondition, Repetitions } from './condition-messages';
import { IFollowCondition, Follow } from './condition-messages';

export interface ISignedTransferPctAction extends ITransferPctAction {
    signature: string;
    description: string;
}

export interface ITransferPctAction {
    scriptId: string;
    token: string;
    destination: string;
    percentage: BigNumber;
    user: string;
    executor: string;
    chainId: BigNumber;
    balance: IBalanceCondition;
    frequency: IFrequencyCondition;
    price: IPriceCondition;
    repetitions: IMaxRepetitionsCondition;
    follow: IFollowCondition;
}

const TransferPct = [
    { name: "scriptId", type: "bytes32" },                // the id of the script
    { name: "token", type: "address" },                   // the token owned by the user
    { name: "destination", type: "address" },             // the address the token will be sent to
    { name: "percentage", type: "uint256" },              // the percentage to transfer
    { name: "user", type: "address" },                    // the user that is signing the transaction
    { name: "executor", type: "address" },                // the executor contract this message will be sent to
    { name: "chainId", type: "uint256" },                 // the chain in which the message was signed
    { name: "balance", type: "Balance" },                 // condition: balance
    { name: "frequency", type: "Frequency" },             // condition: frequency
    { name: "price", type: "Price" },                     // condition: balance
    { name: "repetitions", type: "Repetitions" },         // condition: max repetitions
    { name: "follow", type: "Follow" },                   // condition: after script
];

export const domain = {
    name: "Daemons-Transfer-Pct-v1"
};

export const types = {
    Follow,
    Frequency,
    Balance,
    TransferPct,
    Price,
    Repetitions,
};
