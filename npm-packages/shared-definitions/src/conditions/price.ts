import { BigNumber } from "ethers";
import { ComparisonType } from "./shared";

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
