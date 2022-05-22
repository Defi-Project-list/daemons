import { BigNumber } from "ethers";
import { IHealthFactorCondition } from "@daemons-fi/shared-definitions";
import { ZeroAddress } from "./shared";

export class HealthFactorFactory {
    /** A disabled frequency condition */
    public static empty = (): IHealthFactorCondition => ({
        enabled: false,
        kontract: ZeroAddress,
        comparison: 0,
        amount: BigNumber.from(0)
    });

    /** A frequency condition built from json (rebuilding serialized objects) */
    public static fromJson = (healthFactorJson?: any): IHealthFactorCondition =>
        healthFactorJson
            ? {
                  enabled: healthFactorJson.enabled,
                  kontract: healthFactorJson.kontract,
                  comparison: healthFactorJson.comparison,
                  amount: BigNumber.from(healthFactorJson.amount)
              }
            : HealthFactorFactory.empty();
}
