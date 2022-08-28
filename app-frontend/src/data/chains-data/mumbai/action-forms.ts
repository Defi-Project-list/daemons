import {
    AdvancedMoneyMarketActionType,
    AmountType,
    BaseMoneyMarketActionType,
    BeefyActionType,
    InterestRateMode,
    ZapOutputChoice
} from "@daemons-fi/shared-definitions/build";
import {
    IAdvancedMMActionForm,
    IBaseMMActionForm,
    ISwapActionForm,
    ITransferActionForm,
    IZapInActionForm,
    IZapOutActionForm,
    IBeefyActionForm,
    ScriptAction,
    IPassActionForm
} from "../action-form-interfaces";
import { IAction } from "../interfaces";
import {
    AaveHealthFactorCondition,
    BalanceCondition,
    FrequencyCondition,
    PriceCondition,
    RepetitionsCondition
} from "./condition-forms";
import { mumbaiAaveMM, mumbaiQuickswapDEX, mumbaiSushiDEX } from "./tokens";

export const TransferAction: IAction = {
    title: "Transfer",
    info: "Transfer some tokens from your wallet to another address.",

    form: {
        type: ScriptAction.TRANSFER,
        valid: false,
        tokenAddress: "",
        destinationAddress: "",
        amountType: AmountType.Absolute,
        floatAmount: 0,
        floatTip: 0
    } as ITransferActionForm,

    conditions: [FrequencyCondition, BalanceCondition, PriceCondition, RepetitionsCondition]
};

export const QuickSwapAction: IAction = {
    title: "Swap on QuickSwap",
    info: "Swap one token for another using the QuickSwap DEX.",

    form: {
        type: ScriptAction.SWAP,
        valid: false,
        tokenFromAddress: "",
        tokenToAddress: "",
        amountType: AmountType.Absolute,
        floatAmount: 0,
        floatTip: 0,
        dex: mumbaiQuickswapDEX
    } as ISwapActionForm,

    conditions: [FrequencyCondition, BalanceCondition, PriceCondition, RepetitionsCondition]
};

export const SushiSwapAction: IAction = {
    title: "Swap on Sushi",
    info: "Swap one token for another using the Sushi DEX.",

    form: {
        type: ScriptAction.SWAP,
        valid: false,
        tokenFromAddress: "",
        tokenToAddress: "",
        amountType: AmountType.Absolute,
        floatAmount: 0,
        floatTip: 0,
        dex: mumbaiSushiDEX
    } as ISwapActionForm,

    conditions: [FrequencyCondition, BalanceCondition, PriceCondition, RepetitionsCondition]
};

export const AaveMMBaseAction: IAction = {
    title: "AAVE Deposit/Withdraw",
    info: "Deposit and withdraw tokens into Aave.",

    form: {
        type: ScriptAction.MM_BASE,
        valid: false,
        tokenAddress: "",
        amountType: AmountType.Absolute,
        floatAmount: 0,
        floatTip: 0,
        actionType: BaseMoneyMarketActionType.Deposit,
        moneyMarket: mumbaiAaveMM
    } as IBaseMMActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
        AaveHealthFactorCondition
    ]
};

export const AaveMMAdvancedAction: IAction = {
    title: "AAVE Borrow/Repay",
    info: "Borrow and repay from Aave.",

    form: {
        type: ScriptAction.MM_ADV,
        valid: false,
        tokenAddress: "",
        interestType: InterestRateMode.Variable,
        amountType: AmountType.Absolute,
        floatAmount: 0,
        floatTip: 0,
        actionType: AdvancedMoneyMarketActionType.Repay,
        moneyMarket: mumbaiAaveMM
    } as IAdvancedMMActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
        AaveHealthFactorCondition
    ]
};

export const ZapInAction: IAction = {
    title: "Zap In (Quickswap)",
    info: "Creates an LP",

    form: {
        type: ScriptAction.ZAP_IN,
        valid: false,
        tokenA: "",
        tokenB: "",
        pair: "",
        amountTypeA: AmountType.Absolute,
        amountTypeB: AmountType.Absolute,
        floatAmountA: 0,
        floatAmountB: 0,
        floatTip: 0,
        dex: mumbaiQuickswapDEX
    } as IZapInActionForm,

    conditions: [FrequencyCondition, BalanceCondition, PriceCondition, RepetitionsCondition]
};

export const ZapOutAction: IAction = {
    title: "Zap Out (Quickswap)",
    info: "Breaks an LP into it's basic components",

    form: {
        type: ScriptAction.ZAP_OUT,
        valid: false,
        tokenA: "",
        tokenB: "",
        amountType: AmountType.Percentage,
        floatAmount: 50,
        floatTip: 0,
        outputChoice: ZapOutputChoice.bothTokens,
        dex: mumbaiQuickswapDEX
    } as IZapOutActionForm,

    conditions: [FrequencyCondition, BalanceCondition, PriceCondition, RepetitionsCondition]
};

export const BeefyAction: IAction = {
    title: "Beefy",
    info: "Deposit or Withdraw LPs from Beefy",

    form: {
        type: ScriptAction.BEEFY,
        valid: true,
        lpAddress: "",
        mooAddress: "",
        lpName: "",
        action: BeefyActionType.Deposit,
        amountType: AmountType.Percentage,
        floatAmount: 50,
        floatTip: 0
    } as IBeefyActionForm,

    conditions: [FrequencyCondition, BalanceCondition, PriceCondition, RepetitionsCondition]
};

export const PassAction: IAction = {
    title: "Pass",
    info: "This action does nothing but checking. Can be chained to other actions to create more complex behaviors (e.g. a transfer using the health score as condition)",

    form: {
        type: ScriptAction.PASS,
        valid: true,
        floatTip: 0
    } as IPassActionForm,

    conditions: [
        FrequencyCondition,
        BalanceCondition,
        PriceCondition,
        RepetitionsCondition,
        AaveHealthFactorCondition
    ]
};
