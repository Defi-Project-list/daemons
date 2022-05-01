import { utils } from "ethers";
import { IPriceCondition } from "@daemons-fi/shared-definitions";
import { ConditionTitles, Token } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { IPriceConditionForm } from "../../data/chains-data/condition-form-interfaces";
import { PriceFactory } from "@daemons-fi/scripts-definitions/build";

export class PriceConditionFactory extends PriceFactory {
    /** A price condition built from user inputs */
    public static fromForm = (form: IPriceConditionForm, tokens: Token[]): IPriceCondition => {
        if (!form.valid) throw new Error("Cannot build Price condition from invalid form");

        const token = tokens.filter((token) => token.address === form.tokenAddress)[0];
        const value = utils.parseUnits(form.floatValue.toString(), token.decimals);

        return {
            enabled: true,
            value: value,
            comparison: form.comparison,
            token: token.address
        };
    };

    /** A price condition built from a bundle generated in the new-script-page */
    public static fromBundle = (bundle: ICurrentScript, tokens: Token[]): IPriceCondition => {
        const condition = bundle.conditions[ConditionTitles.PRICE];
        if (!condition) return this.empty();

        const form = condition.form as any as IPriceConditionForm;
        return this.fromForm(form, tokens);
    };
}
