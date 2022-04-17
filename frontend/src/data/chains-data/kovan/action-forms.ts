import { AmountType, BaseMoneyMarketActionType } from '@daemons-fi/shared-definitions/build';
import { IBaseMMActionForm, ISwapActionForm, ITransferActionForm, ScriptAction } from '../action-form-interfaces';
import { IAction } from '../interfaces';
import { AaveHealthFactorCondition, BalanceCondition, FrequencyCondition, PriceCondition, RepetitionsCondition } from './condition-forms';
import { kovanAaveMM } from './tokens';

export const TransferAction: IAction = {
    title: "Transfer",
    info: "Transfer some tokens from your wallet to another address.",

    form: {
        type: ScriptAction.TRANSFER,
        valid: false,
        tokenAddress: '',
        destinationAddress: '',
        amountType: AmountType.Absolute,
        floatAmount: 0,
    } as ITransferActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
    ]
};

export const SwapAction: IAction = {
    title: "Swap",
    info: "Swap one token for another using the Sushi DEX.",

    form: {
        type: ScriptAction.SWAP,
        valid: false,
        tokenFromAddress: '',
        tokenToAddress: '',
        amountType: AmountType.Absolute,
        floatAmount: 0,
    } as ISwapActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
    ]
};

export const AaveMMBaseAction: IAction = {
    title: "AAVE Base",
    info: "Deposit and withdraw tokens into Aave.",

    form: {
        type: ScriptAction.MMBASE,
        valid: false,
        tokenAddress: '',
        amountType: AmountType.Absolute,
        floatAmount: 0,
        actionType: BaseMoneyMarketActionType.Deposit,
        moneyMarket: kovanAaveMM,
    }as IBaseMMActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
        AaveHealthFactorCondition,
    ]
};
