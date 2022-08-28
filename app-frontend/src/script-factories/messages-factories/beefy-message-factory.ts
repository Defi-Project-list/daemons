import { BigNumber, utils } from "ethers";
import { AmountType, IBeefyAction } from "@daemons-fi/shared-definitions";
import { IChainInfo } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { IBeefyActionForm, ScriptAction } from "../../data/chains-data/action-form-interfaces";
import { FrequencyConditionFactory } from "../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../conditions-factories/follow-condition-factory";

export class BeefyMessageFactory {
    public static async create(
        bundle: ICurrentScript,
        chain: IChainInfo,
        provider: any
    ): Promise<IBeefyAction> {
        const beefyActionForm = bundle.action.form as IBeefyActionForm;
        if (!chain.contracts.BeefyScriptExecutor)
            throw new Error("The BeefyScriptExecutor has not been deployed on this chain");

        if (beefyActionForm.type !== ScriptAction.BEEFY)
            throw new Error(
                `Cannot build Beefy message with this form: ${JSON.stringify(beefyActionForm)}`
            );

        if (!beefyActionForm.valid)
            throw new Error(`Cannot build Beefy message with an invalid form`);

        const tokens = chain.tokens;

        const frequencyCondition = await FrequencyConditionFactory.fromBundle(bundle, provider);
        const balanceCondition = BalanceConditionFactory.fromBundle(bundle, tokens);
        const priceCondition = PriceConditionFactory.fromBundle(bundle, tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromBundle(bundle);
        const followCondition = FollowConditionFactory.fromBundle(bundle);

        let amount: BigNumber;
        if (beefyActionForm.amountType === AmountType.Absolute) {
            // absolute amount (LPs always have 18 decimals)
            amount = utils.parseUnits(beefyActionForm.floatAmount.toString(), 18);
        } else {
            // percentage amount
            amount = BigNumber.from(beefyActionForm.floatAmount.toString());
        }

        const tip = utils.parseEther(beefyActionForm.floatTip.toString());

        return {
            scriptId: bundle.id,
            typeAmt: beefyActionForm.amountType,
            amount: amount,
            tip: tip,
            lpAddress: beefyActionForm.lpAddress!,
            mooAddress: beefyActionForm.mooAddress!,
            action: beefyActionForm.action,
            user: await provider.getSigner().getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            executor: chain.contracts.BeefyScriptExecutor,
            chainId: BigNumber.from(chain.id)
        };
    }
}
