import React, { useEffect, useState } from "react";
import { ITransferActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form, Field } from "react-final-form";
import { ethers } from "ethers";
import { RootState, useAppSelector } from "../../../../state";
import { TokensModal } from "../../../../components/tokens-modal";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { Token } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";
import { AmountInput } from "../shared/amount-input";

const validateForm = (values: ITransferActionForm) => {
    const errors: any = {};
    if (!values.floatAmount || (values.floatAmount as any) === "") {
        errors.floatAmount = "required";
    }
    if (values.floatAmount && Number(values.floatAmount) <= 0) {
        errors.floatAmount = "required > 0";
    }
    if (!values.destinationAddress || values.destinationAddress === "") {
        errors.destinationAddress = "required";
    }
    if (values.destinationAddress && !ethers.utils.isAddress(values.destinationAddress)) {
        errors.destinationAddress = "it does not seem a valid address";
    }
    return errors;
};

const isFormValid = (values: ITransferActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const TransferAction = ({
    form,
    update
}: {
    form: ITransferActionForm;
    update: (next: ITransferActionForm) => void;
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
                    <div className="transfer-block">
                        <div className="script-block__panel--two-columns">
                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokens.find((t) => t.address === form.tokenAddress)}
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

                        <Field name="destinationAddress" component="select">
                            {({ input, meta }) => (
                                <input
                                    {...input}
                                    placeholder="Destination Address"
                                    className={`script-block__input ${
                                        meta.error ? "script-block__input--error" : ""
                                    }`}
                                    onChange={(e) => {
                                        input.onChange(e);
                                        const updatedForm = {
                                            ...form,
                                            destinationAddress: e.target.value
                                        };
                                        const valid = isFormValid(updatedForm);
                                        update({ ...updatedForm, valid });
                                    }}
                                />
                            )}
                        </Field>

                        <div className="script-block__info">
                            {selectedToken &&
                                `Current ${selectedToken?.symbol} balance: ${
                                    tokenBalances[selectedToken.address]
                                }`}
                        </div>

                        {/* ENABLE WHEN DEBUGGING!  */}
                        {/* <p>{JSON.stringify(form, null, " ")}</p> */}
                    </div>
                </form>
            )}
        />
    );
};
