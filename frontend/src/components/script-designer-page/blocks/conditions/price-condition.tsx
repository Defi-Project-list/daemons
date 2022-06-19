import React, { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { TokensModal } from "../shared/tokens-modal";
import { DEX, Token } from "../../../../data/chains-data/interfaces";
import { IPriceConditionForm } from "../../../../data/chains-data/condition-form-interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";
import { ethers } from "ethers";
import { UniswapV2RouterABI } from "@daemons-fi/abis/build";
import { bigNumberToFloat } from "../../../../utils/big-number-to-float";

const validateForm = (form: IPriceConditionForm) => {
    const errors: any = {};
    if (!form.floatValue || (form.floatValue as any) === "") errors.floatValue = "required";
    if (form.floatValue && Number(form.floatValue) <= 0) errors.floatValue = "required > 0";
    if (!form.tokenA) errors.tokenA = "required";
    if (!form.tokenB) errors.tokenB = "required";
    if (form.tokenA === form.tokenB) errors.tokenB = "tokens must be different";
    if (!form.dex) errors.dex = "required";
    return errors;
};

const isFormValid = (values: IPriceConditionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

const retrieveCurrentPrice = async (
    form: IPriceConditionForm,
    tokens: Token[]
): Promise<number | undefined> => {
    if (!form.tokenA || !form.tokenB || !form.dex) return;

    // Get DEX router contract
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const dex = new ethers.Contract(form.dex.poolAddress, UniswapV2RouterABI, provider);

    // Get tokens from addresses
    const tokenA = tokens.find((t) => t.address === form.tokenA);
    const tokenB = tokens.find((t) => t.address === form.tokenB);
    if (!tokenA || !tokenB) {
        console.error(`It was impossible to retrieve the tokens from the given list`);
        return;
    }

    // Get current quote
    const one = ethers.utils.parseUnits("1", tokenA.decimals);
    try {
        const quote = (await dex.getAmountsOut(one, [tokenA.address, tokenB.address]))[1];
        return bigNumberToFloat(quote, 5, tokenB.decimals);
    } catch (error) {
        console.error(`Seems like the pair is not supported!: ${error}`);
        return -1;
    }
};

export const PriceCondition = ({
    form,
    update
}: {
    form: IPriceConditionForm;
    update: (next: IPriceConditionForm) => void;
}) => {
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [dexes, setDexes] = useState<DEX[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number | undefined>();
    const [loadingPrice, setLoadingPrice] = useState<boolean>(false);

    useEffect(() => {
        const newTokenA = !form.tokenA && tokens.length ? tokens[0].address : form.tokenA;
        const newTokenB = !form.tokenB && tokens.length ? tokens[1].address : form.tokenB;
        const newDEX = !form.dex && dexes.length > 0 ? dexes[0] : form.dex;

        update({
            ...form,
            tokenA: newTokenA,
            tokenB: newTokenB,
            dex: newDEX
        });
    }, [tokens, dexes]);

    useEffect(() => {
        if (chainId) {
            const currentChain = GetCurrentChain(chainId);
            setTokens(currentChain.tokens);
            setDexes(currentChain.dexes);
        }
    }, [chainId]);

    useEffect(() => {
        setLoadingPrice(true);
        retrieveCurrentPrice(form, tokens).then((price) => {
            setLoadingPrice(false);
            setCurrentPrice(price);
        });
    }, [chainId, tokens, form.tokenA, form.tokenB, form.dex]);

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => {
                /** Individual forms are not submitted */
            }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className="condition-block">
                        <div className="script-block__panel--two-columns price-block">
                            <div>Select DEX:</div>
                            <Field name="dex" component="select">
                                {({ input }) => (
                                    <select
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            const dex = dexes.find(
                                                (d) => d.poolAddress === e.target.value
                                            );
                                            update({ ...form, dex });
                                        }}
                                        className="price-block__dex"
                                    >
                                        {dexes.map((dex) => (
                                            <option key={dex.poolAddress} value={dex.poolAddress}>
                                                {dex.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </Field>
                        </div>

                        <div className="script-block__panel--two-columns price-block">
                            <div>When</div>
                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokens.find((t) => {
                                    console.log(form.tokenA);
                                    return t.address === form.tokenA;
                                })}
                                setSelectedToken={(token) => {
                                    const updatedForm = { ...form, tokenA: token.address };
                                    const valid = isFormValid(updatedForm);
                                    update({ ...updatedForm, valid });
                                }}
                            />
                        </div>

                        <div className="script-block__panel--three-columns price-block">
                            <div>is worth</div>

                            <Field name="comparison" component="select">
                                {({ input }) => (
                                    <select
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            update({ ...form, comparison: Number(e.target.value) });
                                        }}
                                        className="price-block__comparison"
                                    >
                                        <option value={0}>&gt;</option>
                                        <option value={1}>&lt;</option>
                                    </select>
                                )}
                            </Field>

                            <div>than</div>
                        </div>

                        <div className="script-block__panel--two-columns price-block">
                            <Field
                                name="floatValue"
                                component="input"
                                type="number"
                                placeholder="1.00"
                            >
                                {({ input, meta }) => (
                                    <input
                                        {...input}
                                        className={`price-block__value ${
                                            meta.error ? "script-block__field--error" : null
                                        }`}
                                        onChange={(e) => {
                                            e.target.value =
                                                Number(e.target.value) < 0 ? "0" : e.target.value;
                                            input.onChange(e);
                                            const updatedForm = {
                                                ...form,
                                                floatValue: Number(e.target.value)
                                            };
                                            const valid = isFormValid(updatedForm);
                                            update({ ...updatedForm, valid });
                                        }}
                                    />
                                )}
                            </Field>

                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokens.find((t) => t.address === form.tokenB)}
                                setSelectedToken={(token) => {
                                    const updatedForm = { ...form, tokenB: token.address };
                                    const valid = isFormValid(updatedForm);
                                    update({ ...updatedForm, valid });
                                }}
                            />
                        </div>

                        <div>
                            {loadingPrice
                                ? `Loading price...`
                                : currentPrice === undefined
                                ? `Current price unknown`
                                : currentPrice < 0
                                ? `The pair seems unsupported! Use at your own risk!`
                                : `Current price: ${currentPrice}`}
                        </div>
                    </div>
                </form>
            )}
        />
    );
};
