import React, { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import { RootState, useAppSelector } from "../../../../state";
import { TokensModal } from "../../../../components/tokens-modal";
import { Token } from "../../../../data/chains-data/interfaces";
import { IBalanceConditionForm } from "../../../../data/chains-data/condition-form-interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";

const validateForm = (form: IBalanceConditionForm) => {
    const errors: any = {};
    if (!form.floatAmount || (form.floatAmount as any) === "") {
        errors.floatAmount = "required";
    }
    if (form.floatAmount && Number(form.floatAmount) <= 0) {
        errors.floatAmount = "required > 0";
    }
    return errors;
};

const isFormValid = (values: IBalanceConditionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const BalanceCondition = ({
    form,
    update
}: {
    form: IBalanceConditionForm;
    update: (next: IBalanceConditionForm) => void;
}) => {
    const chainId = useAppSelector((state: RootState) => state.user.chainId);
    const tokenBalances = useAppSelector((state: RootState) => state.wallet.tokenBalances);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [selectedToken, setSelectedToken] = useState<Token | undefined>();

    useEffect(() => {
        if (!form.tokenAddress && tokens.length > 0) {
            const selectedToken = tokens[0];
            setSelectedToken(selectedToken);
            update({ ...form, tokenAddress: selectedToken.address });
        }
    }, [tokens]);

    useEffect(() => {
        if (chainId) setTokens(GetCurrentChain(chainId).tokens);
    }, [chainId]);

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => {
                /** Individual forms are not submitted */
            }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className="script-block__panel--three-columns balance-block">
                        <TokensModal
                            tokens={tokens}
                            selectedToken={tokens.find((t) => t.address === form.tokenAddress)}
                            setSelectedToken={(token) => {
                                setSelectedToken(token);
                                update({ ...form, tokenAddress: token.address });
                            }}
                        />

                        <Field name="comparison" component="select">
                            {({ input }) => (
                                <select
                                    {...input}
                                    onChange={(e) => {
                                        input.onChange(e);
                                        update({ ...form, comparison: Number(e.target.value) });
                                    }}
                                    className="script-block__comparison"
                                >
                                    <option value={0}>&gt;</option>
                                    <option value={1}>&lt;</option>
                                </select>
                            )}
                        </Field>

                        <Field
                            name="floatAmount"
                            component="input"
                            type="number"
                            placeholder="1.00"
                        >
                            {({ input, meta }) => (
                                <input
                                    {...input}
                                    className={`script-block__input ${
                                        meta.error ? "script-block__input--error" : null
                                    }`}
                                    onChange={(e) => {
                                        e.target.value =
                                            Number(e.target.value) < 0 ? "0" : e.target.value;
                                        input.onChange(e);
                                        const updatedForm = {
                                            ...form,
                                            floatAmount: Number(e.target.value)
                                        };
                                        const valid = isFormValid(updatedForm);
                                        update({ ...updatedForm, valid });
                                    }}
                                />
                            )}
                        </Field>
                    </div>

                    <div className="script-block__info">
                        {selectedToken &&
                            `Current ${selectedToken?.symbol} balance: ${
                                tokenBalances[selectedToken.address]
                            }`}
                    </div>

                    {/* ENABLE WHEN DEBUGGING!  */}
                    {/* <p>{JSON.stringify(form, null, ' ')}</p> */}
                </form>
            )}
        />
    );
};
