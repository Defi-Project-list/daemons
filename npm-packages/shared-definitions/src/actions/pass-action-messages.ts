import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance } from "../conditions/balance";
import { IFollowCondition, Follow } from "../conditions/follow";
import { IFrequencyCondition, Frequency } from "../conditions/frequency";
import { IHealthFactorCondition, HealthFactor } from '../conditions/health-factor';
import { IMaxRepetitionsCondition, Repetitions } from "../conditions/max-repetitions";
import { IPriceCondition, Price } from "../conditions/price";

export interface ISignedPassAction extends IPassAction {
    signature: string;
    description: string;
}

export interface IPassAction {
    scriptId: string;
    user: string;
    executor: string;
    chainId: BigNumber;
    tip: BigNumber;
    balance: IBalanceCondition;
    frequency: IFrequencyCondition;
    price: IPriceCondition;
    repetitions: IMaxRepetitionsCondition;
    follow: IFollowCondition;
    healthFactor: IHealthFactorCondition;
}

const Pass = [
    { name: "scriptId", type: "bytes32" },              // the script identifier
    { name: "user", type: "address" },                  // the user that is signing the transaction
    { name: "executor", type: "address" },              // the executor contract this message will be sent to
    { name: "chainId", type: "uint256" },               // the chain in which the message was signed
    { name: "tip", type: "uint256" },                   // the tip in DAEM for the executor
    { name: "balance", type: "Balance" },               // condition: balance
    { name: "frequency", type: "Frequency" },           // condition: frequency
    { name: "price", type: "Price" },                   // condition: balance
    { name: "repetitions", type: "Repetitions" },       // condition: max repetitions
    { name: "follow", type: "Follow" },                 // condition: after script
    { name: "healthFactor", type: "HealthFactor" },     // condition: MM health factor
];

export const passDomain = {
    name: "Daemons-Pass-v01"
};

export const passTypes = {
    Follow,
    Frequency,
    Balance,
    Pass,
    Price,
    Repetitions,
    HealthFactor,
};
