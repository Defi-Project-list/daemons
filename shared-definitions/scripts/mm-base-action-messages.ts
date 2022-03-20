import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance, AmountType } from './condition-messages';
import { IPriceCondition, Price } from './condition-messages';
import { IFrequencyCondition, Frequency } from './condition-messages';
import { IMaxRepetitionsCondition, Repetitions } from './condition-messages';
import { IFollowCondition, Follow } from './condition-messages';

export interface ISignedMMBaseAction extends IMMBaseAction {
    signature: string;
    description: string;
}

export enum BaseMoneyMarketActionType { Deposit = 0, Withdraw = 1 };

export interface IMMBaseAction {
    scriptId: string;
    token: string;
    aToken: string;
    action: BaseMoneyMarketActionType;
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

const MmBase = [
    { name: "scriptId", type: "bytes32" },           // the script identifier
    { name: "token", type: "address" },              // the native token
    { name: "aToken", type: "address" },             // the aToken
    { name: "action", type: "bytes1" },              // the action to perform [deposit, withdraw]
    { name: "typeAmt", type: "bytes1" },             // the amount type [absolute, percentage]
    { name: "amount", type: "uint256" },             // the amount to supply/withdraw
    { name: "user", type: "address" },               // the user that is signing the transaction
    { name: "kontract", type: "address" },           // the MM contract to interface with
    { name: "executor", type: "address" },           // the executor contract this message will be sent to
    { name: "chainId", type: "uint256" },            // the chain in which the message was signed
    { name: "balance", type: "Balance" },            // condition: balance
    { name: "frequency", type: "Frequency" },        // condition: frequency
    { name: "price", type: "Price" },                // condition: balance
    { name: "repetitions", type: "Repetitions" },    // condition: max repetitions
    { name: "follow", type: "Follow" },              // condition: follow script
];

export const domain = {
    name: "Daemons-MM-Base-v01"
};

export const types = {
    Frequency,
    Balance,
    MmBase,
    Price,
    Repetitions,
    Follow,
};
