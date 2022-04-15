import { BigNumber } from 'ethers';


export enum AmountType { Absolute = 0, Percentage = 1 }


export enum ComparisonType { GreaterThan = 0, LessThan = 1 }

export interface IBalanceCondition {
    enabled: boolean;
    token: string;
    comparison: ComparisonType;
    amount: BigNumber;
}

export const Balance = [
    { name: "enabled", type: "bool" },                    // indicates whether the condition should be checked
    { name: "token", type: "address" },                   // the token that will be checked
    { name: "comparison", type: "bytes1" },           // the comparison symbol [">", "<"]
    { name: "amount", type: "uint256" },               // the threshold that will trigger the condition
];

export interface IFrequencyCondition {
    enabled: boolean;
    delay: BigNumber;
    start: BigNumber;
}

export const Frequency = [
    { name: "enabled", type: "bool" },             // indicates whether the condition should be checked
    { name: "delay", type: "uint256" },            // the number of blocks to  be waited between each action
    { name: "start", type: "uint256" },            // the first block that will be counted
];

export interface IPriceCondition {
    enabled: boolean;
    token: string;
    comparison: ComparisonType;
    value: BigNumber;
}

export const Price = [
    { name: "enabled", type: "bool" },                    // indicates whether the condition should be checked
    { name: "token", type: "address" },                   // the token that will be checked
    { name: "comparison", type: "bytes1" },           // the comparison symbol [">", "<"]
    { name: "value", type: "uint256" },                    // the threshold that will trigger the condition
];

export interface IMaxRepetitionsCondition {
    enabled: boolean;
    amount: BigNumber;
}

export const Repetitions = [
    { name: "enabled", type: "bool" },                    // indicates whether the condition should be checked
    { name: "amount", type: "uint32" },                 // the maximum number of times the script can be ran
];

export interface IFollowCondition {
    enabled: boolean;
    shift: BigNumber;
    scriptId: string;
    executor: string;
}

export const Follow = [
    { name: "enabled", type: "bool" },                   // indicates whether the condition should be checked
    { name: "shift", type: "uint256" },                    // the threshold that will trigger the condition
    { name: "scriptId", type: "bytes32" },               // the token owned by the user
    { name: "executor", type: "address" },             // the executor contract this message will be sent to
];

export interface IHealthFactorCondition {
    enabled: boolean;
    kontract: string;
    comparison: ComparisonType;
    amount: BigNumber;
}

export const HealthFactor = [
    { name: "enabled", type: "bool" },                // indicates whether the condition should be checked
    { name: "kontract", type: "address" },           // the MM contract to interact with
    { name: "comparison", type: "bytes1" },           // the comparison symbol [">", "<"]
    { name: "amount", type: "uint256" },              // the threshold that will trigger the condition
];
