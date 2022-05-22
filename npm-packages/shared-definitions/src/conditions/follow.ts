import { BigNumber } from "ethers";

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
