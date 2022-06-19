import { ComparisonType } from '@daemons-fi/shared-definitions';
import { DEX } from "./interfaces";


export enum ScriptConditions {
    FREQUENCY = "FREQUENCY",
    BALANCE = "BALANCE",
    PRICE = "PRICE",
    REPETITIONS = "REPETITIONS",
    FOLLOW = "FOLLOW",
    HEALTH_FACTOR = "HEALTH_FACTOR",
}

export interface IScriptConditionForm {
    type: ScriptConditions;
    valid: boolean;
}

export enum FrequencyUnits { Seconds = 1, Minutes = 60, Hours = 3600, Days = 86400, Weeks = 604800 };

export interface IFrequencyConditionForm extends IScriptConditionForm {
    type: ScriptConditions.FREQUENCY;
    ticks: number;
    unit: FrequencyUnits;
    startNow: boolean;
}

export interface IBalanceConditionForm extends IScriptConditionForm {
    type: ScriptConditions.BALANCE;
    tokenAddress?: string;
    comparison: ComparisonType;
    floatAmount: number;
}

export interface IPriceConditionForm extends IScriptConditionForm {
    type: ScriptConditions.PRICE;
    dex?: DEX;
    tokenA?: string;
    tokenB?: string;
    comparison: ComparisonType;
    floatValue: number;
}

export interface IRepetitionsConditionForm extends IScriptConditionForm {
    type: ScriptConditions.REPETITIONS;
    amount: number;
}

export interface IFollowConditionForm extends IScriptConditionForm {
    type: ScriptConditions.FOLLOW;
    shift: number;
    parentScriptId: string;
    parentScriptExecutor: string;
}

export interface IHealthFactorConditionForm extends IScriptConditionForm {
    type: ScriptConditions.HEALTH_FACTOR;
    contractAddress: string;
    comparison: ComparisonType;
    floatAmount: number;
}



export type ConditionForm = IFrequencyConditionForm
    | IBalanceConditionForm
    | IPriceConditionForm
    | IRepetitionsConditionForm
    | IFollowConditionForm
    | IHealthFactorConditionForm;
