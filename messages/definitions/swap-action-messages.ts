import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance } from './condition-messages';
import { IPriceCondition, Price } from './condition-messages';
import { IFrequencyCondition, Frequency } from './condition-messages';

export interface ISwapAction {
    id: string;
    tokenFrom: string;
    tokenTo: string;
    amount: BigNumber;
    user: string;
    executor: string;
    balance: IBalanceCondition;
    frequency: IFrequencyCondition;
    price: IPriceCondition;
}

const Swap = [
    { name: "id", type: "bytes32" },                           // the token owned by the user
    { name: "tokenFrom", type: "address" },             // the token owned by the user
    { name: "tokenTo", type: "address" },                  // the token that should be swapped
    { name: "amount", type: "uint256" },                   // the amount to swap
    { name: "user", type: "address" },                        // the user that is signing the transaction
    { name: "executor", type: "address" },                 // the executor contract this message will be sent to
    { name: "balance", type: "Balance" },                   // condition: balance
    { name: "frequency", type: "Frequency" },           // condition: frequency
    { name: "price", type: "Price" },                            // condition: balance
];

export const domain = {
    name: "Balrog-Swap-v1"
};

export const types = {
    Frequency,
    Balance,
    Swap,
    Price,
};
