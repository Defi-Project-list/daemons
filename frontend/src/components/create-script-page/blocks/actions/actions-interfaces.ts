export interface ISwapActionForm extends ICreateScriptForm {
    tokenFromAddress: string;
    tokenToAddress: string;
    floatAmount: number;
}

export interface IDAOActionForm extends ICreateScriptForm {
}

export interface IFarmActionForm extends ICreateScriptForm {
}
