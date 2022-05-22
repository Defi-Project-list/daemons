import { BigNumber } from "ethers";
import { IBalanceCondition } from "@daemons-fi/shared-definitions";
import { ZeroAddress } from "./shared";

export class BalanceFactory {
  /** A disabled balance condition */
  public static empty = (): IBalanceCondition => ({
    enabled: false,
    amount: BigNumber.from(0),
    comparison: 0,
    token: ZeroAddress,
  });

  /** A balance condition built from json (rebuilding serialized objects) */
  public static fromJson = (balanceJson?: any): IBalanceCondition =>
    balanceJson
      ? {
          enabled: balanceJson.enabled,
          amount: BigNumber.from(balanceJson.amount),
          comparison: balanceJson.comparison,
          token: balanceJson.token,
        }
      : BalanceFactory.empty();
}
