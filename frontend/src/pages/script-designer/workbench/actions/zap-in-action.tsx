import React, { useEffect, useState } from "react";
import { IZapInActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form } from "react-final-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { TokensModal } from "../../../../components/tokens-modal";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { DEX, Token } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";
import { AmountInput } from "../shared/amount-input";
import { retrieveLpAddress } from "../../../../data/retrieve-lp-address";

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

    if (values.pair === "0x0000000000000000000000000000000000000000"){
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
    const walletAddress = useSelector((state: RootState) => state.user.address);
    const chainId = useSelector((state: RootState) => state.user.chainId);
    const tokenBalances = useSelector((state: RootState) => state.wallet.tokenBalances);
    const [currentLP, setCurrentLP] = useState<string | undefined>();
    const [loadingLP, setLoadingLP] = useState<boolean>(false);
    const [dexes, setDexes] = useState<DEX[]>([]);
    const [selectedDex, setSelectedDex] = useState<DEX | undefined>();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [tokenA, setTokenA] = useState<Token | undefined>();
    const [tokenB, setTokenB] = useState<Token | undefined>();

    useEffect(() => {
        if (chainId) {
            const currentChain = GetCurrentChain(chainId);
            setTokens(currentChain.tokens);
            setDexes(currentChain.dexes);
        }
    }, [chainId]);

    useEffect(() => {
        if (!tokenA && tokens.length) setTokenA(tokens[0]);
        if (!tokenB && tokens.length) setTokenB(tokens[1]);
        if (!selectedDex && dexes.length) setSelectedDex(dexes[0]);
    }, [tokens, dexes]);

    useEffect(() => {
        if (!tokenA || !tokenB || !selectedDex) return;
        setLoadingLP(true);
        retrieveLpAddress(tokenA.address, tokenB.address, selectedDex?.poolAddress).then(
            (lpAddress) => {
                setCurrentLP(lpAddress);
                setLoadingLP(false);
                const updatedForm = {
                    ...form,
                    tokenA: tokenA.address,
                    tokenB: tokenB.address,
                    pair: lpAddress,
                    dex: selectedDex
                };
                const valid = isFormValid(updatedForm);
                update({ ...updatedForm, valid });
            }
        );
    }, [chainId, tokenA, tokenB, selectedDex]);

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
                            selectedToken={tokens.filter((t) => t.address === form.tokenA)[0]}
                            setSelectedToken={(token) => {
                                if (tokenB?.address === token.address) setTokenB(tokenA);
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
                                `Current ${tokenA?.symbol} balance: ${
                                    tokenBalances[tokenA.address]
                                }`}
                        </div>

                        <div style={{ width: "100%", textAlign: "center", fontSize: "1.4rem" }}>
                            <span>+</span>
                        </div>

                        <TokensModal
                            tokens={tokens}
                            selectedToken={tokens.filter((t) => t.address === form.tokenB)[0]}
                            setSelectedToken={(token) => {
                                if (tokenA?.address === token.address) setTokenA(tokenB);
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

                        <div className="script-block__info" style={{ marginTop: "20px" }}>
                            <div>LP Address:</div>
                            <div style={{ wordBreak: "break-word" }}>
                                {loadingLP
                                    ? "Fetching LP address..."
                                    : currentLP === "0x0000000000000000000000000000000000000000"
                                    ? "This pair is not supported on this DEX"
                                    : currentLP}
                            </div>
                        </div>

                        {/* ENABLE WHEN DEBUGGING!  */}
                        {/* <p>{JSON.stringify(form, null, " ")}</p> */}
                    </div>
                </form>
            )}
        />
    );
};
