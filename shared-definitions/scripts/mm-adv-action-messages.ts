import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance } from './condition-messages';
import { IPriceCondition, Price } from './condition-messages';
import { IFrequencyCondition, Frequency } from './condition-messages';
import { IMaxRepetitionsCondition, Repetitions } from './condition-messages';
import { IFollowCondition, Follow } from './condition-messages';

export interface ISignedMMAdvancedAction extends IMMAdvancedAction {
    signature: string;
    description: string;
}

export enum AdvancedMoneyMarketActionType { Repay = 0, Borrow = 1 };
export enum InterestRateMode { Fixed = 1, Variable = 2 };

export interface IMMAdvancedAction {
    scriptId: string;
    token: string;
    action: AdvancedMoneyMarketActionType;
    rateMode: InterestRateMode;
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

const MmAdvanced = [
    { name: "scriptId", type: "bytes32" },           // the script identifier
    { name: "token", type: "address" },              // the native token
    { name: "action", type: "bytes1" },              // the action to perform [repay, borrow]
    { name: "rateMode", type: "bytes1" },            // the interest rate mode [variable, fixed]
    { name: "amount", type: "uint256" },             // the amount to repay or borrow
    { name: "user", type: "address" },               // the user that is signing the transaction
    { name: "kontract", type: "address" },           // the MM contract to interact with
    { name: "executor", type: "address" },           // the executor contract this message will be sent to
    { name: "chainId", type: "uint256" },            // the chain in which the message was signed
    { name: "balance", type: "Balance" },            // condition: balance
    { name: "frequency", type: "Frequency" },        // condition: frequency
    { name: "price", type: "Price" },                // condition: balance
    { name: "repetitions", type: "Repetitions" },    // condition: max repetitions
    { name: "follow", type: "Follow" },              // condition: follow script
];

export const domain = {
    name: "Daemons-MM-Advanced-v01"
};

export const types = {
    Frequency,
    Balance,
    MmAdvanced,
    Price,
    Repetitions,
    Follow,
};
