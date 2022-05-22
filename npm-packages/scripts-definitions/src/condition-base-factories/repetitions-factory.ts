import { IMaxRepetitionsCondition } from "@daemons-fi/shared-definitions";
import { BigNumber } from "ethers";

export class RepetitionsFactory {
  /** A disabled repetitions condition */
  public static empty = (): IMaxRepetitionsCondition => ({
    enabled: false,
    amount: BigNumber.from(0),
  });

  /** A repetitions condition built from json (rebuilding serialized objects) */
  public static fromJson = (repetitionsJson?: any): IMaxRepetitionsCondition =>
    repetitionsJson
      ? {
          enabled: repetitionsJson.enabled,
          amount: BigNumber.from(repetitionsJson.amount),
        }
      : RepetitionsFactory.empty();
}
