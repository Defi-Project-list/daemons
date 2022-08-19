import React, { useEffect, useState } from "react";
import { Form } from "react-final-form";
import { TokensModal } from "../../../../components/tokens-modal";
import { ToggleButtonField } from "../shared/toggle-button";
import { BaseMoneyMarketActionType } from "@daemons-fi/shared-definitions";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { IBaseMMActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { IToken, Token } from "../../../../data/chains-data/interfaces";
import { AmountInput } from "../shared/amount-input";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import "./mm-action.css";

const validateForm = (values: IBaseMMActionForm) => {
    const errors: any = {};
    if (!values.floatAmount || (values.floatAmount as any) === "") {
        errors.floatAmount = "required";
    }
    if (values.floatAmount && Number(values.floatAmount) <= 0) {
        errors.floatAmount = "required > 0";
    }
    return errors;
};

const isFormValid = (values: IBaseMMActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const MmBaseAction = ({
    form,
    update
}: {
    form: IBaseMMActionForm;
    update: (next: IBaseMMActionForm) => void;
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
                                valuesEnum={BaseMoneyMarketActionType}
                                updateFunction={(newValue) => {
                                    update({ ...form, actionType: newValue });
                                }}
                                initial={form.actionType}
                            />
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
                        </div>

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
                            <div className="mm-base-info__text">{selectedToken.symbol} in wallet</div>
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
                            <div className="mm-base-info__text">{selectedToken.symbol} deposited in {form.moneyMarket.name}</div>
                            <div className="mm-base-info__token">
                                <img
                                    className="mm-base-info__token-img"
                                    src={selectedToken.logoURI}
                                />
                                <div className="mm-base-info__token-balance">
                                    {
                                        thisMM?.deposits[
                                            form.moneyMarket.mmTokens[selectedToken.address].aToken
                                        ]?.balance
                                    }
                                </div>
                                <div className="mm-base-info__token-apy">
                                    APY:{" "}
                                    {
                                        thisMM?.deposits[
                                            form.moneyMarket.mmTokens[selectedToken.address].aToken
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
