import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance, AmountType } from './condition-messages';
import { IPriceCondition, Price } from './condition-messages';
import { IFrequencyCondition, Frequency } from './condition-messages';
import { IMaxRepetitionsCondition, Repetitions } from './condition-messages';
import { IFollowCondition, Follow } from './condition-messages';

export interface ISignedTransferAction extends ITransferAction {
    signature: string;
    description: string;
}

export interface ITransferAction {
    scriptId: string;
    token: string;
    destination: string;
    typeAmt: AmountType;
    amount: BigNumber;
    user: string;
    executor: string;
    chainId: BigNumber;
    balance: IBalanceCondition;
    frequency: IFrequencyCondition;
    price: IPriceCondition;
    repetitions: IMaxRepetitionsCondition;
    follow: IFollowCondition;
}

const Transfer = [
    { name: "scriptId", type: "bytes32" },                   // the token owned by the user
    { name: "token", type: "address" },                      // the token owned by the user
    { name: "destination", type: "address" },             // the token that should be swapped
    { name: "typeAmt", type: "bytes1" },                   // indicated the amount type [Absolute, Percentage]
    { name: "amount", type: "uint256" },                   // the amount to swap
    { name: "user", type: "address" },                        // the user that is signing the transaction
    { name: "executor", type: "address" },                 // the executor contract this message will be sent to
    { name: "chainId", type: "uint256" },                   // the chain in which the message was signed
    { name: "balance", type: "Balance" },                   // condition: balance
    { name: "frequency", type: "Frequency" },           // condition: frequency
    { name: "price", type: "Price" },                            // condition: balance
    { name: "repetitions", type: "Repetitions" },        // condition: max repetitions
    { name: "follow", type: "Follow" },                       // condition: after script
];

export const domain = {
    name: "Daemons-Transfer-v01"
};

export const types = {
    Follow,
    Frequency,
    Balance,
    Transfer,
    Price,
    Repetitions,
};
