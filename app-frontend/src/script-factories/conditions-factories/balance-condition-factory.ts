import { utils } from "ethers";
import { IBalanceCondition } from "@daemons-fi/shared-definitions";
import { ConditionTitles, Token } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { IBalanceConditionForm } from "../../data/chains-data/condition-form-interfaces";
import { BalanceFactory } from "@daemons-fi/scripts-definitions/build";

export class BalanceConditionFactory extends BalanceFactory {

    /** A balance condition built from user inputs */
    public static fromForm = (form: IBalanceConditionForm, tokens: Token[]): IBalanceCondition => {
        if (!form.valid) throw new Error("Cannot build Balance condition from invalid form");

        const token = tokens.filter((token) => token.address === form.tokenAddress)[0];
        const amount = utils.parseUnits(form.floatAmount.toString(), token.decimals);

        return {
            enabled: true,
            amount: amount,
            comparison: form.comparison,
            token: token.address
        };
    };

    /** A balance condition built from a bundle generated in the new-script-page */
    public static fromBundle = (bundle: ICurrentScript, tokens: Token[]): IBalanceCondition => {
        const condition = bundle.conditions[ConditionTitles.BALANCE];
        if (!condition) return this.empty();

        const form = condition.form as any as IBalanceConditionForm;
        return this.fromForm(form, tokens);
    };
}
