import { BigNumber } from "ethers";
import { IMaxRepetitionsCondition } from "@daemons-fi/shared-definitions";
import { ICurrentScript } from "../i-current-script";
import { ConditionTitles } from "../../data/chains-data/interfaces";
import { IRepetitionsConditionForm } from "../../data/chains-data/condition-form-interfaces";
import { RepetitionsFactory } from "@daemons-fi/scripts-definitions/build";

export class RepetitionsConditionFactory extends RepetitionsFactory {
    /** A repetitions condition built from user inputs */
    public static fromForm = (form: IRepetitionsConditionForm): IMaxRepetitionsCondition => {
        if (!form.valid) throw new Error("Cannot build Repetitions condition from invalid form");

        return {
            enabled: true,
            amount: BigNumber.from(Math.min(form.amount, 4294967295)) // truncate to uint32
        };
    };

    /** A repetitions condition built from a bundle generated in the new-script-page */
    public static fromBundle = (bundle: ICurrentScript): IMaxRepetitionsCondition => {
        const condition = bundle.conditions[ConditionTitles.REPETITIONS];
        if (!condition) return this.empty();

        const form = condition.form as any as IRepetitionsConditionForm;
        return this.fromForm(form);
    };
}
