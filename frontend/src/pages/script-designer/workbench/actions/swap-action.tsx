import React, { useEffect, useState } from "react";
import { ISwapActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form } from "react-final-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { TokensModal } from "../../../../components/tokens-modal";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { IToken, Token } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";
import { AmountInput } from "../shared/amount-input";
import { LpInfoBox } from "../../../../components/lp-info";

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
    const chainId = useSelector((state: RootState) => state.user.chainId);
    const tokenBalances = useSelector((state: RootState) => state.wallet.tokenBalances);
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
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>
                    <div className="swap-block">
                        <div className="script-block__panel--three-columns">
                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokenA}
                                setSelectedToken={(token) => {
                                    if (tokenB.address === token.address) setTokenB(tokenA);
                                    setTokenA(token);
                                }}
                            />

                            <div
                                className="script-block__icon script-block__icon--right script-block__icon--clickable"
                                onClick={() => {
                                    setTokenA(tokenB);
                                    setTokenB(tokenA);
                                }}
                            />

                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokenB}
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

                        <div className="script-block__info">
                            {`Current ${tokenA?.symbol} balance: ${tokenBalances[tokenA.address]}`}
                        </div>

                        <LpInfoBox
                            showOwned={false}
                            dexRouter={form.dex.poolAddress}
                            tokenA={tokenA}
                            tokenB={tokenB}
                        />
                    </div>
                </form>
            )}
        />
    );
};
