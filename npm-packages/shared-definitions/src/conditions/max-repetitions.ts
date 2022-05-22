import { BigNumber } from "ethers";


export interface IMaxRepetitionsCondition {
    enabled: boolean;
    amount: BigNumber;
}

export const Repetitions = [
    { name: "enabled", type: "bool" },                    // indicates whether the condition should be checked
    { name: "amount", type: "uint32" },                 // the maximum number of times the script can be ran
];
