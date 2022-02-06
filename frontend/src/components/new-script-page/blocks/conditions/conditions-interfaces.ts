import { ComparisonType } from '../../../../../../messages/definitions/condition-messages';
import { BaseScript } from '../../../../data/script/base-script';
import { INewScriptForm } from '../../i-new-script-form';

interface IScriptConditionForm extends INewScriptForm {
    enabled: boolean;
}

export enum FrequencyUnits { Seconds = 604800, Minutes = 10080, Hours = 168, Days = 7, Weeks = 1 };

export interface IFrequencyConditionForm extends IScriptConditionForm {
    ticks: number;
    unit: FrequencyUnits;
    startNow: boolean;
}

export interface IBalanceConditionForm extends IScriptConditionForm {
    tokenAddress?: string;
    comparison: ComparisonType;
    floatAmount: number;
}

export interface IPriceConditionForm extends IScriptConditionForm {
    tokenAddress?: string;
    comparison: ComparisonType;
    floatValue: number;
}

export interface IRepetitionsConditionForm extends IScriptConditionForm {
    amount: number;
}

export interface IFollowConditionForm extends IScriptConditionForm {
    parentScript?: BaseScript;
}
