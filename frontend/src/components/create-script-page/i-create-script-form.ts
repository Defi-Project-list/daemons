import { IScriptActionForm } from './blocks/actions/actions-interfaces';
import { IBalanceConditionForm, IFrequencyConditionForm, IPriceConditionForm } from './blocks/conditions/conditions-interfaces';

export interface ICreateScriptForm {
    valid: boolean;
}

export interface ICreateScriptBundle {
    frequencyCondition: IFrequencyConditionForm;
    balanceCondition: IBalanceConditionForm;
    priceCondition: IPriceConditionForm;
    actionForm: IScriptActionForm;
}
