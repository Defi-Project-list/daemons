import { BigNumber } from "ethers";
import { ComparisonType } from "./shared";

export interface IPriceCondition {
    enabled: boolean;
    tokenA: string;
    tokenB: string;
    comparison: ComparisonType;
    value: BigNumber;
    router: string;
}

export const Price = [
    { name: "enabled", type: "bool" },          // indicates whether the condition should be checked
    { name: "tokenA", type: "address" },        // the token that will be checked
    { name: "tokenB", type: "address" },        // the token representing the price threshold
    { name: "comparison", type: "bytes1" },     // the comparison symbol [">", "<"]
    { name: "value", type: "uint256" },         // the threshold that will trigger the condition
    { name: "router", type: "address" },        // the DEX that will be used to check the price
];
