import { BigNumber } from "ethers";
import { IPriceCondition } from "@daemons-fi/shared-definitions";
import { ZeroAddress } from "./shared";

export class PriceFactory {
  /** A disabled price condition */
  public static empty = (): IPriceCondition => ({
    enabled: false,
    value: BigNumber.from(0),
    comparison: 0,
    token: ZeroAddress,
  });

  /** A price condition built from json (rebuilding serialized objects) */
  public static fromJson = (priceJson?: any): IPriceCondition =>
    priceJson
      ? {
          enabled: priceJson.enabled,
          value: BigNumber.from(priceJson.value),
          comparison: priceJson.comparison,
          token: priceJson.token,
        }
      : PriceFactory.empty();
}
