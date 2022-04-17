import { BigNumber } from "ethers";
import { IFollowCondition } from "@daemons-fi/shared-definitions";
import { ZeroAddress, ZeroId } from "../../data/chain-info";
import { ICurrentScript } from "../i-current-script";
import { ConditionTitles } from "../../data/chains-data/interfaces";
import { IFollowConditionForm } from "../../data/chains-data/condition-form-interfaces";

export class FollowConditionFactory {
    /** A disabled frequency condition */
    public static empty = (): IFollowCondition => ({
        enabled: false,
        scriptId: ZeroId,
        executor: ZeroAddress,
        shift: BigNumber.from(0)
    });

    /** A frequency condition built from json (rebuilding serialized objects) */
    public static fromJson = (followJson?: any): IFollowCondition =>
        followJson
            ? {
                  enabled: followJson.enabled,
                  scriptId: followJson.scriptId,
                  executor: followJson.executor,
                  shift: BigNumber.from(followJson.shift)
              }
            : this.empty();

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
