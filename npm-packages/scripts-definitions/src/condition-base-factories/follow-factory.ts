import { BigNumber } from "ethers";
import { IFollowCondition } from "@daemons-fi/shared-definitions";
import { ZeroAddress, ZeroId } from "./shared";

export class FollowFactory {
  /** A disabled frequency condition */
  public static empty = (): IFollowCondition => ({
    enabled: false,
    scriptId: ZeroId,
    executor: ZeroAddress,
    shift: BigNumber.from(0),
  });

  /** A frequency condition built from json (rebuilding serialized objects) */
  public static fromJson = (followJson?: any): IFollowCondition =>
    followJson
      ? {
          enabled: followJson.enabled,
          scriptId: followJson.scriptId,
          executor: followJson.executor,
          shift: BigNumber.from(followJson.shift),
        }
      : FollowFactory.empty();
}
