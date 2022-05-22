import { BigNumber } from "ethers";

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
