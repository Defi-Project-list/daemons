import {
    AdvancedMoneyMarketActionType,
    AmountType,
    BaseMoneyMarketActionType,
    ComparisonType,
    InterestRateMode
} from "@daemons-fi/shared-definitions/build";
import {
    IAdvancedMMActionForm,
    IBaseMMActionForm,
    ISwapActionForm,
    ITransferActionForm,
    ScriptAction
} from "../data/chains-data/action-form-interfaces";
import {
    IBalanceConditionForm,
    IFollowConditionForm,
    IFrequencyConditionForm,
    IHealthFactorConditionForm,
    IPriceConditionForm,
    IRepetitionsConditionForm,
    ScriptConditions
} from "../data/chains-data/condition-form-interfaces";
import { IAction, ICondition, Token } from "../data/chains-data/interfaces";
import { ICurrentScript } from "./i-current-script";

export class ScriptDescriptionFactory {
    private readonly tokensDict: { [address: string]: Token };

    public constructor(tokens: Token[]) {
        this.tokensDict = {};
        tokens.forEach((t) => (this.tokensDict[t.address] = t));
    }

    public extractDefaultDescription(script: ICurrentScript) {
        const actionDescription = this.extractActionDescription(script.action);
        const conditionDescriptions = Object.values(script.conditions).map((condition) =>
            this.extractConditionDescription(condition)
        );
        const description = [actionDescription, ...conditionDescriptions].join("\n\n");
        return description;
    }

    private extractActionDescription(action: IAction): string {
        switch (action.form.type) {
            case ScriptAction.SWAP:
                return this.swapAction(action.form as ISwapActionForm);
            case ScriptAction.TRANSFER:
                return this.transferAction(action.form as ITransferActionForm);
            case ScriptAction.MM_BASE:
                return this.mmBaseAction(action.form as IBaseMMActionForm);
            case ScriptAction.MM_ADV:
                return this.mmAdvancedAction(action.form as IAdvancedMMActionForm);
            default:
                console.error(`Unknown action ${action.form.type}.`);
                return `#!@!# Unknown action ${action.form.type}. Please add to factory #!@!#`;
        }
    }

    private swapAction(form: ISwapActionForm): string {
        const tokenFro = this.tokensDict[form.tokenFromAddress];
        const tokenTo = this.tokensDict[form.tokenToAddress];
        return `Swap ${form.floatAmount} ${tokenFro.symbol} for ${tokenTo.symbol}`;
    }

    private transferAction(form: ITransferActionForm): string {
        const token = this.tokensDict[form.tokenAddress];
        const destination = form.destinationAddress.substring(0, 8) + "...";
        return `Send ${form.floatAmount} ${token.symbol} to ${destination}`;
    }

    private mmBaseAction(form: IBaseMMActionForm): string {
        const token = this.tokensDict[form.tokenAddress];
        return form.actionType === BaseMoneyMarketActionType.Deposit
            ? `Deposit ${form.floatAmount} ${token.symbol} into ${form.moneyMarket.name}`
            : `Withdraw ${form.floatAmount} ${token.symbol} from ${form.moneyMarket.name}`;
    }

    private mmAdvancedAction(form: IAdvancedMMActionForm): string {
        const token = this.tokensDict[form.tokenAddress];
        const interestType =
            form.interestType === InterestRateMode.Fixed ? "Fixed interests" : "Variable interests";

        switch (form.actionType) {
            case AdvancedMoneyMarketActionType.Borrow:
                if (form.amountType === AmountType.Absolute) {
                    // Borrow 500 DAI from AAVE (Fixed interests)
                    return `Borrow ${form.floatAmount} ${token.symbol} from ${form.moneyMarket.name} (${interestType})`;
                }
                // Borrow 75% of the total borrowable power, in DAI, from Aave (Fixed interests)
                return `Borrow ${form.floatAmount / 100}% of the total borrowable power, in ${
                    token.symbol
                }, from ${form.moneyMarket.name} (${interestType})`;
            case AdvancedMoneyMarketActionType.Repay:
                if (form.amountType === AmountType.Absolute) {
                    // Repay 500 DAI to AAVE (Fixed interests)
                    return `Repay ${form.floatAmount} ${token.symbol} to ${form.moneyMarket.name} (${interestType})`;
                }
                // Repay 75% of the total DAI debt, on Aave (Fixed interests)
                return `Repay ${form.floatAmount / 100}% of the total ${token.symbol} debt on ${
                    form.moneyMarket.name
                } (${interestType})`;
            default:
                return `Unsupported action ${form.actionType}`;
        }

        // ? `Deposit ${form.floatAmount} ${token.symbol} into ${form.moneyMarket.name}`
        // : `Withdraw ${form.floatAmount} ${token.symbol} from ${form.moneyMarket.name}`;
    }

    private extractConditionDescription(condition: ICondition): string {
        switch (condition.form.type) {
            case ScriptConditions.BALANCE:
                return this.balanceCondition(condition.form as IBalanceConditionForm);
            case ScriptConditions.PRICE:
                return this.priceCondition(condition.form as IPriceConditionForm);
            case ScriptConditions.FREQUENCY:
                return this.frequencyCondition(condition.form as IFrequencyConditionForm);
            case ScriptConditions.REPETITIONS:
                return this.repetitionsCondition(condition.form as IRepetitionsConditionForm);
            case ScriptConditions.FOLLOW:
                return this.followCondition(condition.form as IFollowConditionForm);
            case ScriptConditions.HEALTH_FACTOR:
                return this.healthFactorCondition(condition.form as IHealthFactorConditionForm);
            default:
                console.error(`Unknown condition ${condition.form.type}.`);
                return `#!@!# Unknown condition ${condition.form.type}. Please add to factory #!@!#`;
        }
    }

    private balanceCondition(form: IBalanceConditionForm): string {
        const token = this.tokensDict[form.tokenAddress ?? ""];
        const comparison = form.comparison === ComparisonType.GreaterThan ? ">" : "<";
        return `When ${token.symbol} in wallet ${comparison} ${form.floatAmount}`;
    }

    private priceCondition(form: IPriceConditionForm): string {
        const token = this.tokensDict[form.tokenAddress ?? ""];
        const comparison = form.comparison === ComparisonType.GreaterThan ? ">" : "<";
        return `When ${token.symbol} in is worth ${comparison} ${form.floatValue}`;
    }

    private frequencyCondition(form: IFrequencyConditionForm): string {
        const startingNow = form.startNow ? ", starting now" : "";
        return `With a minimum delay of ${form.ticks} ${form.unit} between executions${startingNow}`;
    }

    private repetitionsCondition(form: IRepetitionsConditionForm): string {
        return `At most ${form.amount} times`;
    }

    private followCondition(form: IFollowConditionForm): string {
        return `Following ${form.parentScriptId}`;
    }

    private healthFactorCondition(form: IHealthFactorConditionForm): string {
        const comparison = form.comparison === ComparisonType.GreaterThan ? ">" : "<";
        return `When health factor is ${comparison} ${form.floatAmount}`;
    }
}
