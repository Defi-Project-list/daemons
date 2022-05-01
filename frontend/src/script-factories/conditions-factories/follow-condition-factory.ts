import { BigNumber } from "ethers";
import { IFollowCondition } from "@daemons-fi/shared-definitions";
import { ICurrentScript } from "../i-current-script";
import { ConditionTitles } from "../../data/chains-data/interfaces";
import { IFollowConditionForm } from "../../data/chains-data/condition-form-interfaces";
import { FollowFactory } from "@daemons-fi/scripts-definitions/build";

export class FollowConditionFactory extends FollowFactory {
    /** A frequency condition built from user inputs */
    public static fromForm = (form: IFollowConditionForm): IFollowCondition => {
        if (!form.parentScriptId || !form.parentScriptExecutor) {
            return this.empty();
        }
        if (!form.valid) throw new Error("Cannot build Follow condition from invalid form");

        return {
            enabled: true,
            scriptId: form.parentScriptId,
            executor: form.parentScriptExecutor,
            shift: BigNumber.from(form.shift)
        };
    };

    /** A follow condition built from a bundle generated in the new-script-page */
    public static fromBundle = (bundle: ICurrentScript): IFollowCondition => {
        const condition = bundle.conditions[ConditionTitles.FOLLOW];
        if (!condition) return this.empty();

        const form = condition.form as any as IFollowConditionForm;
        return this.fromForm(form);
    };
}
