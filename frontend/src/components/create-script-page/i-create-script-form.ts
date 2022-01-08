import { IScriptActionForm } from './blocks/actions/actions-interfaces';
import { IBalanceConditionForm, IFrequencyConditionForm } from './blocks/conditions/conditions-interfaces';

export interface ICreateScriptForm {
    valid: boolean;
}

export interface ICreateScriptBundle {
    frequencyCondition: IFrequencyConditionForm;
    balanceCondition: IBalanceConditionForm;
    actionForm: IScriptActionForm;
}
