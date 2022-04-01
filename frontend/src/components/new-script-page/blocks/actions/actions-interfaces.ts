import { AmountType } from '../../../../../../shared-definitions/scripts/condition-messages';
import { BaseMoneyMarketActionType } from '../../../../../../shared-definitions/scripts/mm-base-action-messages';
import { MoneyMarket } from '../../../../data/tokens';
import { INewScriptForm } from '../../i-new-script-form';

export enum ScriptAction {
    None,
    Swap,
    Transfer,
    MmBase,
    Dao,
    Farm,
}

export interface IScriptActionForm extends INewScriptForm {
    action: ScriptAction;
}

export interface ISwapActionForm extends IScriptActionForm {
    tokenFromAddress: string;
    tokenToAddress: string;
    amountType: AmountType;
    floatAmount: number;
}

export interface ITransferActionForm extends IScriptActionForm {
    tokenAddress: string;
    destinationAddress: string;
    amountType: AmountType;
    floatAmount: number;
}

export interface IBaseMMActionForm extends IScriptActionForm {
    tokenAddress: string;
    actionType: BaseMoneyMarketActionType;
    amountType: AmountType;
    floatAmount: number;
    moneyMarket: MoneyMarket;
}

export interface IDAOActionForm extends IScriptActionForm {
}

export interface IFarmActionForm extends IScriptActionForm {
}

export interface INoActionForm extends IScriptActionForm {
    valid: false;
}
