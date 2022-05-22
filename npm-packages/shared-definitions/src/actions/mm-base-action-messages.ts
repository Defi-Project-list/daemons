import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance } from "../conditions/balance";
import { IFollowCondition, Follow } from "../conditions/follow";
import { IFrequencyCondition, Frequency } from "../conditions/frequency";
import { IHealthFactorCondition, HealthFactor } from '../conditions/health-factor';
import { IMaxRepetitionsCondition, Repetitions } from "../conditions/max-repetitions";
import { IPriceCondition, Price } from "../conditions/price";
import { AmountType } from "../conditions/shared";

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
    healthFactor: IHealthFactorCondition;
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
    { name: "healthFactor", type: "HealthFactor" },  // condition: MM health factor
];

export const mmBaseDomain = {
    name: "Daemons-MM-Base-v01"
};

export const mmBaseTypes = {
    Frequency,
    Balance,
    MmBase,
    Price,
    Repetitions,
    Follow,
    HealthFactor,
};
