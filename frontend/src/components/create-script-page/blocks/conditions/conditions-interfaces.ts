import { ComparisonType } from '../../../../messages/condition-messages';
import { ICreateScriptForm } from '../../i-create-script-form';

interface IScriptConditionForm extends ICreateScriptForm {
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
