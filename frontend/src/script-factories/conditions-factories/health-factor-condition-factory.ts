import { ethers } from "ethers";
import { IHealthFactorCondition } from "@daemons-fi/shared-definitions";
import { ICurrentScript } from "../i-current-script";
import { ConditionTitles } from "../../data/chains-data/interfaces";
import { IHealthFactorConditionForm } from "../../data/chains-data/condition-form-interfaces";
import { HealthFactorFactory } from "@daemons-fi/scripts-definitions/build";

export class HealthFactorConditionFactory extends HealthFactorFactory {
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
