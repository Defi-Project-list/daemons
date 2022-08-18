import React, { useEffect, useState } from "react";
import { IZapInActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form } from "react-final-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { TokensModal } from "../../../../components/tokens-modal";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { Token } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain, ZeroAddress } from "../../../../data/chain-info";
import { AmountInput } from "../shared/amount-input";
import { LpInfoBox } from "../../../../components/lp-info";

const validateForm = (values: IZapInActionForm) => {
    const errors: any = {};

    const amountAZero =
        !values.floatAmountA ||
        (values.floatAmountA as any) === "" ||
        (values.floatAmountA && Number(values.floatAmountA) <= 0);
    const amountBZero =
        !values.floatAmountB ||
        (values.floatAmountB as any) === "" ||
        (values.floatAmountB && Number(values.floatAmountB) <= 0);

    if (amountAZero && amountBZero) {
        errors.floatAmountA = "required > 0";
        errors.floatAmountB = "required > 0";
    }

    if (values.pair === "0x0000000000000000000000000000000000000000") {
        errors.pair = "This pair is not supported on this DEX";
    }

    return errors;
};

const isFormValid = (values: IZapInActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const ZapInAction = ({
    form,
    update
}: {
    form: IZapInActionForm;
    update: (next: IZapInActionForm) => void;
}) => {
    const chainId = useSelector((state: RootState) => state.user.chainId);
    const tokenBalances = useSelector((state: RootState) => state.wallet.tokenBalances);
    const tokens = GetCurrentChain(chainId!).tokens;
    const dexes = GetCurrentChain(chainId!).dexes;
    const selectedDex = dexes[0];
    const [tokenA, setTokenA] = useState<Token>(tokens[0]);
    const [tokenB, setTokenB] = useState<Token>(tokens[1]);
    const [pairAddress, setPairAddress] = useState<string>(ZeroAddress);

    useEffect(() => {
        if (!tokenA || !tokenB) return;
        const updatedForm = {
            ...form,
            tokenA: tokenA.address,
            tokenB: tokenB.address,
            pair: pairAddress,
            dex: selectedDex
        };
        const valid = isFormValid(updatedForm);
        update({ ...updatedForm, valid });
    }, [tokenA, tokenB, pairAddress]);

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
                        <TokensModal
                            tokens={tokens}
                            selectedToken={tokenA}
                            setSelectedToken={(token) => {
                                if (tokenB.address === token.address) setTokenB(tokenA);
                                setTokenA(token);
                            }}
                        />

                        <div style={{ height: "5px" }} />

                        <AmountInput
                            buttonName="amountTypeA"
                            inputName="floatAmountA"
                            initialAmountType={form.amountTypeA}
                            processNewValue={(amountTypeA: AmountType, floatAmountA: number) => {
                                const updatedForm = { ...form, amountTypeA, floatAmountA };
                                const valid = isFormValid(updatedForm);
                                update({ ...updatedForm, valid });
                            }}
                        />
                        <div className="script-block__info">
                            {tokenA &&
                                `Current ${tokenA.symbol} balance: ${
                                    tokenBalances[tokenA.address]
                                }`}
                        </div>

                        <div style={{ width: "100%", textAlign: "center", fontSize: "1.4rem" }}>
                            <span>+</span>
                        </div>

                        <TokensModal
                            tokens={tokens}
                            selectedToken={tokenB}
                            setSelectedToken={(token) => {
                                if (tokenA.address === token.address) setTokenA(tokenB);
                                setTokenB(token);
                            }}
                        />

                        <div style={{ height: "5px" }} />

                        <AmountInput
                            buttonName="amountTypeB"
                            inputName="floatAmountB"
                            initialAmountType={form.amountTypeB}
                            processNewValue={(amountTypeB: AmountType, floatAmountB: number) => {
                                const updatedForm = { ...form, amountTypeB, floatAmountB };
                                const valid = isFormValid(updatedForm);
                                update({ ...updatedForm, valid });
                            }}
                        />
                        <div className="script-block__info">
                            {tokenB &&
                                `Current ${tokenB?.symbol} balance: ${
                                    tokenBalances[tokenB.address]
                                }`}
                        </div>

                        <LpInfoBox
                            showOwned={true}
                            dexRouter={form.dex.poolAddress}
                            tokenA={tokenA}
                            tokenB={tokenB}
                            setLpAddress={setPairAddress}
                        />

                        {/* ENABLE WHEN DEBUGGING!  */}
                        {/* <p>{JSON.stringify(form, null, " ")}</p> */}
                    </div>
                </form>
            )}
        />
    );
};
