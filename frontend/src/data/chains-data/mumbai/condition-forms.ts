import { ComparisonType } from "@daemons-fi/shared-definitions/build";
import { FrequencyUnits, IHealthFactorConditionForm } from "../condition-form-interfaces";
import { IBalanceConditionForm } from "../condition-form-interfaces";
import { IFrequencyConditionForm } from "../condition-form-interfaces";
import { IPriceConditionForm } from "../condition-form-interfaces";
import { IRepetitionsConditionForm } from "../condition-form-interfaces";
import { ScriptConditions } from "../condition-form-interfaces";
import { ConditionTitles, ICondition } from "../interfaces";
import { mumbaiAaveMM } from "./tokens";

export const FrequencyCondition: ICondition = {
    title: ConditionTitles.FREQUENCY,
    info: "Execute the scripts with a certain frequency, like every 1 hour or 15 minutes.",

    form: {
        type: ScriptConditions.FREQUENCY,
        valid: true,
        ticks: 1,
        unit: FrequencyUnits.Hours,
        startNow: true
    } as IFrequencyConditionForm
};

export const BalanceCondition: ICondition = {
    title: ConditionTitles.BALANCE,
    info:
        "Execute the scripts only when you own a certain quantity of a token in your wallet.",

    form: {
        type: ScriptConditions.BALANCE,
        valid: false,
        comparison: ComparisonType.GreaterThan,
        floatAmount: 0
    } as IBalanceConditionForm
};

export const PriceCondition: ICondition = {
    title: ConditionTitles.PRICE,
    info: "Execute the scripts only when the price of a token passes a threshold.",

    form: {
        type: ScriptConditions.PRICE,
        valid: false,
        comparison: ComparisonType.GreaterThan,
        floatValue: 0
    } as IPriceConditionForm
};

export const RepetitionsCondition: ICondition = {
    title: ConditionTitles.REPETITIONS,
    info: "Set a maximum number of times a script should be run.",

    form: {
        type: ScriptConditions.REPETITIONS,
        valid: false,
        amount: 0
    } as IRepetitionsConditionForm
};

export const AaveHealthFactorCondition: ICondition = {
    title: ConditionTitles.HEALTH_FACTOR,
    info: "Execute the script when the AAVE health factor passes a threshold.",

    form: {
        type: ScriptConditions.HEALTH_FACTOR,
        valid: true,
        contractAddress: mumbaiAaveMM.poolAddress,
        comparison: ComparisonType.LessThan,
        floatAmount: 1.3,
    } as IHealthFactorConditionForm
}
