import { AdvancedMoneyMarketActionType, AmountType, BaseMoneyMarketActionType, InterestRateMode } from '@daemons-fi/shared-definitions/build';
import { IAdvancedMMActionForm, IBaseMMActionForm, ISwapActionForm, ITransferActionForm, ScriptAction } from '../action-form-interfaces';
import { IAction } from '../interfaces';
import { AaveHealthFactorCondition, BalanceCondition, FrequencyCondition, PriceCondition, RepetitionsCondition } from './condition-forms';
import { rinkebyAaveMM, rinkebySushiDEX } from './tokens';

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
    title: "Swap on Sushi",
    info: "Swap one token for another using the Sushi DEX.",

    form: {
        type: ScriptAction.SWAP,
        valid: false,
        tokenFromAddress: '',
        tokenToAddress: '',
        amountType: AmountType.Absolute,
        floatAmount: 0,
        dex: rinkebySushiDEX,
    } as ISwapActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
    ]
};

export const AaveMMBaseAction: IAction = {
    title: "AAVE Deposit/Withdraw",
    info: "Deposit and withdraw tokens into Aave.",

    form: {
        type: ScriptAction.MM_BASE,
        valid: false,
        tokenAddress: '',
        amountType: AmountType.Absolute,
        floatAmount: 0,
        actionType: BaseMoneyMarketActionType.Deposit,
        moneyMarket: rinkebyAaveMM,
    }as IBaseMMActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
        AaveHealthFactorCondition,
    ]
};

export const AaveMMAdvancedAction: IAction = {
    title: "AAVE Borrow/Repay",
    info: "Borrow and repay from Aave.",

    form: {
        type: ScriptAction.MM_ADV,
        valid: false,
        tokenAddress: '',
        interestType: InterestRateMode.Variable,
        amountType: AmountType.Absolute,
        floatAmount: 0,
        actionType: AdvancedMoneyMarketActionType.Borrow,
        moneyMarket: rinkebyAaveMM,
    }as IAdvancedMMActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
        AaveHealthFactorCondition,
    ]
};