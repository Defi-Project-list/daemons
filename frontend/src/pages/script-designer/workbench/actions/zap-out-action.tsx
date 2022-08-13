import React, { useEffect, useState } from "react";
import { IZapOutActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form, Field } from "react-final-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { TokensModal } from "../shared/tokens-modal";
import { AmountType, ZapOutputChoice } from "@daemons-fi/shared-definitions/build";
import { Token } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";
import { AmountInput } from "../shared/amount-input";
import { fetchTokenBalance } from "../../../../data/fetch-token-balance";
import { retrieveLpAddress } from "../../../../data/retrieve-lp-address";

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
    const walletAddress = useSelector((state: RootState) => state.user.address);
    const chainId = useSelector((state: RootState) => state.user.chainId);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [currentBalance, setCurrentBalance] = useState<number | undefined>(undefined);
    const [tokenA, setTokenA] = useState<string | undefined>();
    const [tokenB, setTokenB] = useState<string | undefined>();

    const getTokenName = (address: string) =>
        tokens.find((t) => t.address === address)?.symbol ?? address;

    useEffect(() => {
        if (!tokenA && tokens.length) setTokenA(tokens[0].address);
        if (!tokenB && tokens.length) setTokenB(tokens[1].address);
    }, [tokens]);

    useEffect(() => {
        if (chainId) setTokens(GetCurrentChain(chainId).tokens);
    }, [chainId]);

    useEffect(() => {
        setCurrentBalance(undefined);
        if (!tokenA || !tokenB || !walletAddress) return;

        retrieveLpAddress(tokenA, tokenB, form.dex.poolAddress).then((lpAddress) => {
            if (lpAddress === "0x0000000000000000000000000000000000000000") {
                setCurrentBalance(-1);
            } else {
                fetchTokenBalance(walletAddress, lpAddress).then((balance) =>
                    setCurrentBalance(balance)
                );
            }
            const updatedForm = {
                ...form,
                tokenA,
                tokenB
            };
            const valid = isFormValid(updatedForm);
            update({ ...updatedForm, valid });
        });
    }, [chainId, tokenA, tokenB]);

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
                                selectedToken={tokens.find((t) => t.address === tokenA)}
                                setSelectedToken={(token) => {
                                    if (tokenB === token.address) setTokenB(tokenA);
                                    setTokenA(token.address);
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
                                selectedToken={tokens.find((t) => t.address === tokenB)}
                                setSelectedToken={(token) => {
                                    if (tokenA === token.address) setTokenA(tokenB);
                                    setTokenB(token.address);
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
                                {getTokenName(form.tokenA)} + {getTokenName(form.tokenB)}
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
                            <label htmlFor="id-radio-outcome-token-1">
                                {getTokenName(form.tokenA)}
                            </label>
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
                            <label htmlFor="id-radio-outcome-token-2">
                                {getTokenName(form.tokenB)}
                            </label>
                        </div>

                        <div className="script-block__info">
                            {currentBalance === undefined
                                ? `..fetching balance..`
                                : currentBalance === -1
                                ? "LP not supported by this DEX"
                                : `Current LP balance: ${currentBalance}`}
                        </div>

                        {/* ENABLE WHEN DEBUGGING!  */}
                        {/* <p>{JSON.stringify(form, null, " ")}</p> */}
                    </div>
                </form>
            )}
        />
    );
};
