import React, { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import { TokensModal } from "../shared/tokens-modal";
import { ToggleButtonField } from "../shared/toggle-button";
import { AdvancedMoneyMarketActionType, InterestRateMode } from "@daemons-fi/shared-definitions";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { IAdvancedMMActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { IToken, Token } from "../../../../data/chains-data/interfaces";
import { AmountInput } from "../shared/amount-input";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { fetchTokenBalance } from "../../../../data/fetch-token-balance";

const validateForm = (values: IAdvancedMMActionForm) => {
    const errors: any = {};
    if (!values.floatAmount || (values.floatAmount as any) === "") {
        errors.floatAmount = "required";
    }
    if (values.floatAmount && Number(values.floatAmount) <= 0) {
        errors.floatAmount = "required > 0";
    }
    return errors;
};

const isFormValid = (values: IAdvancedMMActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const MmAdvAction = ({
    form,
    update
}: {
    form: IAdvancedMMActionForm;
    update: (next: IAdvancedMMActionForm) => void;
}) => {
    const walletAddress = useSelector((state: RootState) => state.user.address);
    const [selectedToken, setSelectedToken] = useState<Token | undefined>();
    const [currentBalance, setCurrentBalance] = useState<number | undefined>(undefined);
    const [currentLoan, setCurrentLoan] = useState<number | undefined>(undefined);
    const tokens = form.moneyMarket.supportedTokens;

    useEffect(() => {
        if (!form.tokenAddress && tokens.length > 0) {
            const selectedToken = tokens[0];
            setSelectedToken(selectedToken);
            update({ ...form, tokenAddress: selectedToken.address });
        }
    }, []);

    useEffect(() => {
        if (!selectedToken) return;
        if (form.actionType === AdvancedMoneyMarketActionType.Borrow) return;

        fetchTokenBalance(walletAddress!, selectedToken.address).then((balance) =>
            setCurrentBalance(balance)
        );
    }, [selectedToken, form.actionType, form.interestType]);

    useEffect(() => {
        if (!selectedToken) return;
        if (form.actionType === AdvancedMoneyMarketActionType.Borrow) return;

        const tokenAddress =
            form.interestType === InterestRateMode.Fixed
                ? form.moneyMarket.mmTokens[selectedToken.address].fixDebtToken
                : form.moneyMarket.mmTokens[selectedToken.address].varDebtToken;
        fetchTokenBalance(walletAddress!, tokenAddress).then((balance) => setCurrentLoan(balance));
    }, [selectedToken, form.actionType, form.interestType]);

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => {
                /** Individual forms are not submitted */
            }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className="transfer-block">
                        <div className="script-block__panel--two-columns">
                            <ToggleButtonField
                                name="actionType"
                                valuesEnum={AdvancedMoneyMarketActionType}
                                updateFunction={(newValue) => {
                                    setCurrentBalance(undefined);
                                    setCurrentLoan(undefined);
                                    update({
                                        ...form,
                                        actionType: newValue,
                                        floatAmount:
                                            form.amountType === AmountType.Percentage
                                                ? 50 // reset percentage amount as the MAX changes between borrow and repay
                                                : form.floatAmount
                                    });
                                }}
                                initial={form.actionType}
                            />

                            <ToggleButtonField
                                name="interestType"
                                valuesEnum={InterestRateMode}
                                updateFunction={(newValue) => {
                                    setCurrentLoan(undefined);
                                    update({ ...form, interestType: newValue });
                                }}
                                initial={form.interestType}
                            />
                        </div>

                        <TokensModal
                            tokens={tokens}
                            selectedToken={tokens.find(
                                (t: IToken) => t.address === form.tokenAddress
                            )}
                            setSelectedToken={(token) => {
                                setCurrentBalance(undefined);
                                setCurrentLoan(undefined);
                                setSelectedToken(token);
                                update({ ...form, tokenAddress: token.address });
                            }}
                        />

                        <AmountInput
                            initialAmountType={form.amountType}
                            processNewValue={(amountType: AmountType, floatAmount: number) => {
                                const updatedForm = { ...form, amountType, floatAmount };
                                const valid = isFormValid(updatedForm);
                                update({ ...updatedForm, valid });
                            }}
                        />

                        <div className="script-block__info">
                            {form.actionType === AdvancedMoneyMarketActionType.Borrow
                                ? ""
                                : currentBalance === undefined
                                ? `..fetching balance..`
                                : `${selectedToken?.symbol} balance: ${currentBalance}`}
                        </div>

                        <div className="script-block__info">
                            {form.actionType === AdvancedMoneyMarketActionType.Borrow
                                ? ""
                                : currentBalance === undefined
                                ? `..fetching loan info..`
                                : form.interestType === InterestRateMode.Fixed
                                ? `${currentLoan} ${selectedToken?.symbol} borrowed at FIXED rate`
                                : `${currentLoan} ${selectedToken?.symbol} borrowed at VARIABLE rate`}
                        </div>
                    </div>
                </form>
            )}
        />
    );
};
