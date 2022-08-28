import { BigNumber, utils } from "ethers";
import { IPassAction } from "@daemons-fi/shared-definitions";
import { IChainInfo } from "../../data/chains-data/interfaces";
import { ICurrentScript } from "../i-current-script";
import { IPassActionForm, ScriptAction } from "../../data/chains-data/action-form-interfaces";
import { FrequencyConditionFactory } from "../conditions-factories/frequency-condition-factory";
import { BalanceConditionFactory } from "../conditions-factories/balance-condition-factory";
import { PriceConditionFactory } from "../conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../conditions-factories/repetitions-condition-factory";
import { FollowConditionFactory } from "../conditions-factories/follow-condition-factory";
import { HealthFactorConditionFactory } from "../conditions-factories/health-factor-condition-factory";

export class PassMessageFactory {
    public static async create(
        bundle: ICurrentScript,
        chain: IChainInfo,
        provider: any
    ): Promise<IPassAction> {
        const passActionForm = bundle.action.form as IPassActionForm;
        if (passActionForm.type !== ScriptAction.PASS)
            throw new Error(
                `Cannot build Pass message with this form: ${JSON.stringify(
                    passActionForm
                )}`
            );

        if (!passActionForm.valid)
            throw new Error(`Cannot build Pass message with an invalid form`);

            const tokens = chain.tokens;

        const frequencyCondition = await FrequencyConditionFactory.fromBundle(bundle, provider);
        const balanceCondition = BalanceConditionFactory.fromBundle(bundle, tokens);
        const priceCondition = PriceConditionFactory.fromBundle(bundle, tokens);
        const maxRepetitions = RepetitionsConditionFactory.fromBundle(bundle);
        const followCondition = FollowConditionFactory.fromBundle(bundle);
        const healthFactorCondition = HealthFactorConditionFactory.fromBundle(bundle);

        const tip = utils.parseEther(passActionForm.floatTip.toString());

        return {
            scriptId:bundle.id,
            tip: tip,
            user: await provider.getSigner().getAddress(),
            frequency: frequencyCondition,
            balance: balanceCondition,
            price: priceCondition,
            repetitions: maxRepetitions,
            follow: followCondition,
            healthFactor: healthFactorCondition,
            executor: chain.contracts.PassScriptExecutor,
            chainId: BigNumber.from(chain.id)
        };
    }
}
