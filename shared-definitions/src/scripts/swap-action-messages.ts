import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance, AmountType } from './condition-messages';
import { IPriceCondition, Price } from './condition-messages';
import { IFrequencyCondition, Frequency } from './condition-messages';
import { IMaxRepetitionsCondition, Repetitions } from './condition-messages';
import { IFollowCondition, Follow } from './condition-messages';

export interface ISignedSwapAction extends ISwapAction {
    signature: string;
    description: string;
}

export interface ISwapAction {
    scriptId: string;
    tokenFrom: string;
    tokenTo: string;
    typeAmt: AmountType;
    amount: BigNumber;
    user: string;
    kontract: string;
    executor: string;
    chainId: BigNumber;
    balance: IBalanceCondition;
    frequency: IFrequencyCondition;
    price: IPriceCondition;
    repetitions: IMaxRepetitionsCondition;
    follow: IFollowCondition;
}

const Swap = [
    { name: "scriptId", type: "bytes32" },            // the token owned by the user
    { name: "tokenFrom", type: "address" },           // the token owned by the user
    { name: "tokenTo", type: "address" },             // the token that should be swapped
    { name: "typeAmt", type: "bytes1" },              // indicated the amount type [Absolute, Percentage]
    { name: "amount", type: "uint256" },              // the amount to swap
    { name: "user", type: "address" },                // the user that is signing the transaction
    { name: "kontract", type: "address" },            // the pool that will execute the swap
    { name: "executor", type: "address" },            // the executor contract this message will be sent to
    { name: "chainId", type: "uint256" },             // the chain in which the message was signed
    { name: "balance", type: "Balance" },             // condition: balance
    { name: "frequency", type: "Frequency" },         // condition: frequency
    { name: "price", type: "Price" },                 // condition: balance
    { name: "repetitions", type: "Repetitions" },     // condition: max repetitions
    { name: "follow", type: "Follow" },               // condition: follow script
];

export const swapDomain = {
    name: "Daemons-Swap-v01"
};

export const swapTypes = {
    Frequency,
    Balance,
    Swap,
    Price,
    Repetitions,
    Follow,
};
