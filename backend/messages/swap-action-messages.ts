import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance } from './condition-messages';
import { IFrequencyCondition, Frequency } from './condition-messages';

export interface ISwapAction {
    tokenFrom: string;
    tokenTo: string;
    amount: BigNumber;
    user: string;
    executor: string;
    balance: IBalanceCondition;
    frequency: IFrequencyCondition;
}

const Swap = [
    { name: "tokenFrom", type: "address" },             // the token owned by the user
    { name: "tokenTo", type: "address" },                  // the token that should be swapped
    { name: "amount", type: "uint256" },                   // the amount to swap
    { name: "user", type: "address" },                        // the user that is signing the transaction
    { name: "executor", type: "address" },                 // the executor contract this message will be sent to
    { name: "balance", type: "Balance" },                   // condition: balance
    { name: "frequency", type: "Frequency" },           // condition: frequency
];

export const domain = {
    name: "Balrog-Swap-v1"
};

export const types = {
    Frequency,
    Balance,
    Swap,
};
