import React, { useEffect, useState } from "react";
import { IZapOutActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form, Field } from "react-final-form";
import { RootState, useAppSelector } from "../../../../state";
import { TokensModal } from "../../../../components/tokens-modal";
import { AmountType, ZapOutputChoice } from "@daemons-fi/shared-definitions/build";
import { IToken } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";
import { AmountInput } from "../shared/amount-input";
import { LpInfoBox } from "../../../../components/lp-info";

const validateForm = (values: IZapOutActionForm) => {
    const errors: any = {};
    if (!values.floatAmount || (values.floatAmount as any) === "") {
        errors.floatAmount = "required";
    }
    if (values.floatAmount && Number(values.floatAmount) <= 0) {
        errors.floatAmount = "required > 0";
    }
    return errors;
};

const isFormValid = (values: IZapOutActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const ZapOutAction = ({
    form,
    update
}: {
    form: IZapOutActionForm;
    update: (next: IZapOutActionForm) => void;
}) => {
    const chainId = useAppSelector((state: RootState) => state.user.chainId);
    const tokens = GetCurrentChain(chainId!).tokens;
    const [tokenA, setTokenA] = useState<IToken>(tokens[0]);
    const [tokenB, setTokenB] = useState<IToken>(tokens[1]);

    useEffect(() => {
        const updatedForm = {
            ...form,
            tokenA: tokenA.address,
            tokenB: tokenA.address
        };
        const valid = isFormValid(updatedForm);
        update({ ...updatedForm, valid });
    }, [tokenA, tokenB]);

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => {
                /** Individual forms are not submitted */
            }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className="zap-in-block">
                        <div className="script-block__panel--three-columns">
                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokens.find((t) => t.address === tokenA?.address)}
                                setSelectedToken={(token) => {
                                    if (tokenB.address === token.address) setTokenB(tokenA);
                                    setTokenA(token);
                                }}
                            />

                            <div
                                style={{
                                    width: "100%",
                                    textAlign: "center",
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    fontSize: "1.4rem"
                                }}
                            >
                                <span>+</span>
                            </div>

                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokens.find((t) => t.address === tokenB?.address)}
                                setSelectedToken={(token) => {
                                    if (tokenA.address === token.address) setTokenA(tokenB);
                                    setTokenB(token);
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

                        <p>Select the zap outcome</p>
                        <div className="zap-out-block__outcome-radio">
                            <Field
                                name="outputChoice"
                                component="input"
                                type="radio"
                                value={ZapOutputChoice.bothTokens}
                            >
                                {({ input }) => (
                                    <input
                                        id="id-radio-outcome-both"
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            const updatedForm = {
                                                ...form,
                                                outputChoice: Number(e.target.value)
                                            };
                                            update({ ...updatedForm });
                                        }}
                                    />
                                )}
                            </Field>
                            <label htmlFor="id-radio-outcome-both">
                                {tokenA?.symbol} + {tokenB?.symbol}
                            </label>
                            <Field
                                name="outputChoice"
                                component="input"
                                type="radio"
                                value={ZapOutputChoice.tokenA}
                            >
                                {({ input }) => (
                                    <input
                                        id="id-radio-outcome-token-1"
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            const updatedForm = {
                                                ...form,
                                                outputChoice: Number(e.target.value)
                                            };
                                            update({ ...updatedForm });
                                        }}
                                    />
                                )}
                            </Field>
                            <label htmlFor="id-radio-outcome-token-1">{tokenA?.symbol}</label>
                            <Field
                                name="outputChoice"
                                component="input"
                                type="radio"
                                value={ZapOutputChoice.tokenB}
                            >
                                {({ input }) => (
                                    <input
                                        id="id-radio-outcome-token-2"
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            const updatedForm = {
                                                ...form,
                                                outputChoice: Number(e.target.value)
                                            };
                                            update({ ...updatedForm });
                                        }}
                                    />
                                )}
                            </Field>
                            <label htmlFor="id-radio-outcome-token-2">{tokenB?.symbol}</label>
                        </div>

                        <LpInfoBox
                            tokenA={tokenA}
                            tokenB={tokenB}
                            dexRouter={form.dex.poolAddress}
                            showOwned={true}
                        />

                        {/* ENABLE WHEN DEBUGGING!  */}
                        {/* <p>{JSON.stringify(form, null, " ")}</p> */}
                    </div>
                </form>
            )}
        />
    );
};
