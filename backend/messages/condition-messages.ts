import { BigNumber } from 'ethers';

export interface IBalanceCondition {
    enabled: boolean;
    token: string;
    comparison: string;
    amount: BigNumber;
}

export const Balance = [
    { name: "enabled", type: "bool" },                    // indicates whether the condition should be checked
    { name: "token", type: "address" },                   // the token that will be checked
    { name: "comparison", type: "string" },            // the comparison symbol [">", "<", "=", ">=", "<="]
    { name: "amount", type: "uint256" },               // the threshold that will trigger the condition
];

export interface IFrequencyCondition {
    enabled: boolean;
    blocks: BigNumber;
    startBlock: BigNumber;
}

export const Frequency = [
    { name: "enabled", type: "bool" },                    // indicates whether the condition should be checked
    { name: "blocks", type: "uint256" },                  // the number of blocks to  be waited between each action
    { name: "startBlock", type: "uint256" },            // the first block that will be counted
];
