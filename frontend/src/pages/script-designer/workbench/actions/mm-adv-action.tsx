import React, { useEffect, useState } from "react";
import { Form } from "react-final-form";
import { TokensModal } from "../../../../components/tokens-modal";
import { ToggleButtonField } from "../shared/toggle-button";
import { AdvancedMoneyMarketActionType, InterestRateMode } from "@daemons-fi/shared-definitions";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { IAdvancedMMActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { IToken, Token } from "../../../../data/chains-data/interfaces";
import { AmountInput } from "../shared/amount-input";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import "./mm-action.css";

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
    const tokenBalances = useSelector((state: RootState) => state.wallet.tokenBalances);
    const mmInfo = useSelector((state: RootState) => state.wallet.moneyMarketsInfo);
    const thisMM = mmInfo[form.moneyMarket.poolAddress];

    const tokens = form.moneyMarket.supportedTokens;
    const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);

    useEffect(() => {
        update({ ...form, tokenAddress: selectedToken.address });
    }, []);

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

                        {/* Control displaying wallet and deposited balances (+ APY) */}
                        <div className="mm-base-info">
                            <div className="mm-base-info__text">
                                {selectedToken.symbol} in wallet
                            </div>
                            <div className="mm-base-info__token">
                                <img
                                    className="mm-base-info__token-img"
                                    src={selectedToken.logoURI}
                                />
                                <div className="mm-base-info__token-balance">
                                    {tokenBalances[selectedToken.address]}
                                </div>
                            </div>
                            <div className="mm-base-info__separator" />
                            <div className="mm-base-info__text">
                                {selectedToken.symbol} borrowed with variable rate from {form.moneyMarket.name}
                            </div>
                            <div className="mm-base-info__token">
                                <img
                                    className="mm-base-info__token-img"
                                    src={selectedToken.logoURI}
                                />
                                <div className="mm-base-info__token-balance">
                                    {
                                        thisMM?.varDebts[
                                            form.moneyMarket.mmTokens[selectedToken.address].varDebtToken
                                        ]?.balance
                                    }
                                </div>
                                <div className="mm-base-info__token-apy">
                                    APY:{" "}
                                    {
                                        thisMM?.varDebts[
                                            form.moneyMarket.mmTokens[selectedToken.address].varDebtToken
                                        ]?.APY
                                    }
                                    %
                                </div>
                            </div>
                            <div className="mm-base-info__separator" />
                            <div className="mm-base-info__text">
                                {selectedToken.symbol} borrowed with stable rate from {form.moneyMarket.name}
                            </div>
                            <div className="mm-base-info__token">
                                <img
                                    className="mm-base-info__token-img"
                                    src={selectedToken.logoURI}
                                />
                                <div className="mm-base-info__token-balance">
                                    {
                                        thisMM?.fixDebts[
                                            form.moneyMarket.mmTokens[selectedToken.address].fixDebtToken
                                        ]?.balance
                                    }
                                </div>
                                <div className="mm-base-info__token-apy">
                                    APY:{" "}
                                    {
                                        thisMM?.fixDebts[
                                            form.moneyMarket.mmTokens[selectedToken.address].fixDebtToken
                                        ]?.APY
                                    }
                                    %
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        />
    );
};
