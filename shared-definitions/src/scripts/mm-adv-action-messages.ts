import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance, AmountType } from './condition-messages';
import { IPriceCondition, Price } from './condition-messages';
import { IFrequencyCondition, Frequency } from './condition-messages';
import { IMaxRepetitionsCondition, Repetitions } from './condition-messages';
import { IFollowCondition, Follow } from './condition-messages';
import { IHealthFactorCondition, HealthFactor } from './condition-messages';

export interface ISignedMMAdvancedAction extends IMMAdvancedAction {
    signature: string;
    description: string;
}

export enum AdvancedMoneyMarketActionType { Repay = 0, Borrow = 1 };
export enum InterestRateMode { Fixed = 1, Variable = 2 };

export interface IMMAdvancedAction {
    scriptId: string;
    token: string;
    debtToken: string;
    action: AdvancedMoneyMarketActionType;
    typeAmt: AmountType;
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
    healthFactor: IHealthFactorCondition;
}

const MmAdvanced = [
    { name: "scriptId", type: "bytes32" },           // the script identifier
    { name: "token", type: "address" },              // the native token
    { name: "debtToken", type: "address" },          // the debt token (variable or stable)
    { name: "action", type: "bytes1" },              // the action to perform [repay, borrow]
    { name: "typeAmt", type: "bytes1" },             // the amount type [absolute, percentage]
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
    { name: "healthFactor", type: "HealthFactor" },  // condition: MM health factor
];

export const mmAdvDomain = {
    name: "Daemons-MM-Advanced-v01"
};

export const mmAdvTypes = {
    Frequency,
    Balance,
    MmAdvanced,
    Price,
    Repetitions,
    Follow,
    HealthFactor,
};
