import { ICreateScriptForm } from '../../i-create-script-form';

export enum ScriptAction {
    None,
    Swap,
    Dao,
    Farm,
}

export interface IScriptActionForm extends ICreateScriptForm {
    action: ScriptAction;
}

export interface ISwapActionForm extends IScriptActionForm {
    tokenFromAddress: string;
    tokenToAddress: string;
    floatAmount: number;
}

export interface IDAOActionForm extends IScriptActionForm {
}

export interface IFarmActionForm extends IScriptActionForm {
}

export interface INoActionForm extends IScriptActionForm {
    valid: false;
}
