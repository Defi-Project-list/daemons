import { BigNumber, ethers } from "ethers";
import { IHealthFactorCondition } from "@daemons-fi/shared-definitions";
import { ZeroAddress } from "../../data/chain-info";
import { ICurrentScript } from "../i-current-script";
import { ConditionTitles } from "../../data/chains-data/interfaces";
import { IHealthFactorConditionForm } from "../../data/chains-data/condition-form-interfaces";

export class HealthFactorConditionFactory {
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
            : this.empty();

    /** A frequency condition built from user inputs */
    public static fromForm = (
        form: IHealthFactorConditionForm
    ): IHealthFactorCondition => {
        if (!form.valid) throw new Error("Cannot build HealthFactor condition from invalid form");

        return {
            enabled: true,
            kontract: form.contractAddress,
            comparison: form.comparison,
            amount: ethers.utils.parseEther(form.floatAmount.toString())
        };
    };

    /** A follow condition built from a bundle generated in the new-script-page */
    public static fromBundle = (bundle: ICurrentScript): IHealthFactorCondition => {
        const condition = bundle.conditions[ConditionTitles.HEALTH_FACTOR];
        if (!condition) return this.empty();

        const form = condition.form as any as IHealthFactorConditionForm;
        return this.fromForm(form);
    };
}
