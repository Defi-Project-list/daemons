import { BigNumber } from "ethers";
import { IFrequencyCondition } from "@daemons-fi/shared-definitions";
import { ICurrentScript } from "../i-current-script";
import { ConditionTitles } from "../../data/chains-data/interfaces";
import { IFrequencyConditionForm } from "../../data/chains-data/condition-form-interfaces";
import { FrequencyFactory } from "@daemons-fi/scripts-definitions/build";

export class FrequencyConditionFactory extends FrequencyFactory {
    /** A frequency condition built from user inputs */
    public static fromForm = async (
        form: IFrequencyConditionForm,
        provider: any
    ): Promise<IFrequencyCondition> => {
        if (!form.valid) throw new Error("Cannot build Frequency condition from invalid form");

        const delay = BigNumber.from(form.unit).mul(BigNumber.from(form.ticks));

        // getting timestamp
        const latestBlockNumber = await provider.getBlockNumber();
        const latestBlock = await provider.getBlock(latestBlockNumber);
        const latestBlockTimestamp = BigNumber.from(latestBlock.timestamp);
        const start = form.startNow ? latestBlockTimestamp.sub(delay) : latestBlockTimestamp;

        return {
            enabled: true,
            delay,
            start
        };
    };

    /** A frequency condition built from a bundle generated in the new-script-page */
    public static fromBundle = async (
        bundle: ICurrentScript,
        provider: any
    ): Promise<IFrequencyCondition> => {
        const condition = bundle.conditions[ConditionTitles.FREQUENCY];
        if (!condition) return this.empty();

        const form = condition.form as any as IFrequencyConditionForm;
        return this.fromForm(form, provider);
    };
}
