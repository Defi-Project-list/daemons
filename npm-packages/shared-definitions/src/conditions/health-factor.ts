import { BigNumber } from "ethers";
import { ComparisonType } from "./shared";

export interface IHealthFactorCondition {
  enabled: boolean;
  kontract: string;
  comparison: ComparisonType;
  amount: BigNumber;
}

export const HealthFactor = [
  { name: "enabled", type: "bool" }, // indicates whether the condition should be checked
  { name: "kontract", type: "address" }, // the MM contract to interact with
  { name: "comparison", type: "bytes1" }, // the comparison symbol [">", "<"]
  { name: "amount", type: "uint256" }, // the threshold that will trigger the condition
];
