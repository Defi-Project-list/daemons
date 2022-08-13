import React, { useEffect, useState } from "react";
import { ISwapActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form, Field } from "react-final-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { TokensModal } from "../shared/tokens-modal";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { ToggleButtonField } from "../shared/toggle-button";
import { Token } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";
import { AmountInput } from "../shared/amount-input";
import { fetchTokenBalance } from "../../../../data/fetch-token-balance";

const validateForm = (values: ISwapActionForm) => {
    const errors: any = {};
    if (!values.floatAmount || (values.floatAmount as any) === "") {
        errors.floatAmount = "required";
    }
    if (values.floatAmount && Number(values.floatAmount) <= 0) {
        errors.floatAmount = "required > 0";
    }
    return errors;
};

const isFormValid = (values: ISwapActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const SwapAction = ({
    form,
    update
}: {
    form: ISwapActionForm;
    update: (next: ISwapActionForm) => void;
}) => {
    const walletAddress = useSelector((state: RootState) => state.user.address);
    const chainId = useSelector((state: RootState) => state.user.chainId);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [selectedFromToken, setSelectedFromToken] = useState<Token | undefined>();
    const [currentBalance, setCurrentBalance] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!form.tokenFromAddress || !form.tokenToAddress) {
            const selectedFromToken = tokens[0];
            setSelectedFromToken(selectedFromToken);
            update({
                ...form,
                tokenFromAddress: tokens[0]?.address,
                tokenToAddress: tokens[1]?.address
            });
        }
    }, [tokens]);

    useEffect(() => {
        if (chainId) setTokens(GetCurrentChain(chainId).tokens);
    }, [chainId]);

    useEffect(() => {
        if (!selectedFromToken) return;
        fetchTokenBalance(walletAddress!, selectedFromToken?.address).then((balance) =>
            setCurrentBalance(balance)
        );
    }, [selectedFromToken]);

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => {
                /** Individual forms are not submitted */
            }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>
                    <div className="swap-block">
                        <div className="script-block__panel--three-columns">
                            <TokensModal
                                tokens={tokens}
                                selectedToken={
                                    tokens.filter((t) => t.address === form.tokenFromAddress)[0]
                                }
                                setSelectedToken={(token) => {
                                    const tokenToAddress =
                                        token.address === form.tokenToAddress
                                            ? form.tokenFromAddress
                                            : form.tokenToAddress;
                                    setSelectedFromToken(token);
                                    setCurrentBalance(undefined);
                                    update({
                                        ...form,
                                        tokenFromAddress: token.address,
                                        tokenToAddress
                                    });
                                }}
                            />

                            <div
                                className="script-block__icon script-block__icon--right script-block__icon--clickable"
                                onClick={() => {
                                    update({
                                        ...form,
                                        tokenFromAddress: form.tokenToAddress,
                                        tokenToAddress: form.tokenFromAddress
                                    });
                                }}
                            />

                            <TokensModal
                                tokens={tokens}
                                selectedToken={
                                    tokens.filter((t) => t.address === form.tokenToAddress)[0]
                                }
                                setSelectedToken={(token) => {
                                    const tokenFromAddress =
                                        token.address === form.tokenFromAddress
                                            ? form.tokenToAddress
                                            : form.tokenFromAddress;
                                    update({
                                        ...form,
                                        tokenToAddress: token.address,
                                        tokenFromAddress
                                    });
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
                                : `Current ${selectedFromToken?.symbol} balance: ${currentBalance}`}
                        </div>
                    </div>
                </form>
            )}
        />
    );
};
