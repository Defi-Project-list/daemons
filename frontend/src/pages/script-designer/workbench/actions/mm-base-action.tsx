import React, { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import { TokensModal } from "../shared/tokens-modal";
import { ToggleButtonField } from "../shared/toggle-button";
import { BaseMoneyMarketActionType } from "@daemons-fi/shared-definitions";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { IBaseMMActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { IToken, Token } from "../../../../data/chains-data/interfaces";
import { AmountInput } from "../shared/amount-input";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { fetchTokenBalance } from "../../../../data/fetch-token-balance";

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
    const walletAddress = useSelector((state: RootState) => state.user.address);
    const [selectedToken, setSelectedToken] = useState<Token | undefined>();
    const [currentBalance, setCurrentBalance] = useState<number | undefined>(undefined);
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

        const tokenAddress =
            form.actionType === BaseMoneyMarketActionType.Deposit
                ? selectedToken.address
                : form.moneyMarket.mmTokens[selectedToken.address].aToken;
        fetchTokenBalance(walletAddress!, tokenAddress).then((balance) =>
            setCurrentBalance(balance)
        );
    }, [selectedToken, form.actionType]);

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
                                    setCurrentBalance(undefined);
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
                                    setCurrentBalance(undefined);
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

                        <div className="script-block__info">
                            {currentBalance === undefined
                                ? `..fetching balance..`
                                : form.actionType === BaseMoneyMarketActionType.Deposit
                                ? `${selectedToken?.symbol} balance: ${currentBalance}`
                                : `${currentBalance} ${selectedToken?.symbol} deposited in ${form.moneyMarket.name}`}
                        </div>
                    </div>
                </form>
            )}
        />
    );
};
