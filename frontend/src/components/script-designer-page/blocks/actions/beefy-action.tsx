import React, { useEffect, useState } from "react";
import { IBeefyActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form, Field } from "react-final-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { TokensModal } from "../shared/tokens-modal";
import { DEX, Token } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain } from "../../../../data/chain-info";
import { ethers } from "ethers";
import { UniswapV2FactoryABI, UniswapV2RouterABI } from "@daemons-fi/abis/build";
import { ToggleButtonField } from "../shared/toggle-button";
import { AmountType, BeefyActionType } from "@daemons-fi/shared-definitions/build";

const validateForm = (form: IBeefyActionForm) => {
    const errors: any = {};
    if (!form.floatAmount || (form.floatAmount as any) === "") errors.floatAmount = "required";
    if (form.floatAmount && Number(form.floatAmount) <= 0) errors.floatAmount = "required > 0";
    if (!form.lpAddress) errors.lpAddress = "required";
    if (form.lpAddress === "0x0000000000000000000000000000000000000000")
        errors.lpAddress = "invalid";
    if (!form.mooAddress) errors.mooAddress = "required";
    if (form.mooAddress && !ethers.utils.isAddress(form.mooAddress)) errors.mooAddress = "invalid";
    return errors;
};

const isFormValid = (values: IBeefyActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

const retrieveLpAddress = async (
    tokenA?: string,
    tokenB?: string,
    dexRouter?: string
): Promise<string | undefined> => {
    if (!tokenA || !tokenB || !dexRouter) return;

    // Get DEX router contract
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const dex = new ethers.Contract(dexRouter, UniswapV2RouterABI, provider);

    // Get DEX factory
    const factoryAddress = await dex.factory();
    const factory = new ethers.Contract(factoryAddress, UniswapV2FactoryABI, provider);

    const pairAddress = await factory.getPair(tokenA, tokenB);
    return pairAddress;
};

export const BeefyAction = ({
    form,
    update
}: {
    form: IBeefyActionForm;
    update: (next: IBeefyActionForm) => void;
}) => {
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [currentLP, setCurrentLP] = useState<string | undefined>();
    const [loadingLP, setLoadingLP] = useState<boolean>(false);
    const [dexes, setDexes] = useState<DEX[]>([]);
    const [selectedDex, setSelectedDex] = useState<DEX | undefined>();
    const [tokenA, setTokenA] = useState<string | undefined>();
    const [tokenB, setTokenB] = useState<string | undefined>();

    useEffect(() => {
        if (!tokenA && tokens.length) setTokenA(tokens[0].address);
        if (!tokenB && tokens.length) setTokenB(tokens[1].address);
        if (!selectedDex && dexes.length) setSelectedDex(dexes[0]);
    }, [tokens, dexes]);

    useEffect(() => {
        if (chainId) {
            const currentChain = GetCurrentChain(chainId);
            setTokens(currentChain.tokens);
            setDexes(currentChain.dexes);
        }
    }, [chainId]);

    useEffect(() => {
        setLoadingLP(true);
        retrieveLpAddress(tokenA, tokenB, selectedDex?.poolAddress).then((lpAddress) => {
            setCurrentLP(lpAddress);
            setLoadingLP(false);
            const lpName = getLPName(tokenA, tokenB, selectedDex?.poolAddress);
            const mooAddress = GetCurrentChain(chainId!).beefyMoos[lpAddress ?? ""];
            const updatedForm = {
                ...form,
                lpAddress,
                mooAddress,
                lpName
            };
            const valid = isFormValid(updatedForm);
            update({ ...updatedForm, valid });
        });
    }, [chainId, tokenA, tokenB, selectedDex]);

    const getLPName = (addrA?: string, addrB?: string, router?: string): string => {
        if (!addrA || !addrB || !router) return "";
        const tokenA = tokens.find((t) => t.address === addrA);
        const tokenB = tokens.find((t) => t.address === addrB);
        const dex = dexes.find((d) => d.poolAddress === router);
        if (!tokenA || !tokenB || !dex) return "";
        return `${tokenA.symbol}-${tokenB.symbol}-LP`;
    };

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
                        <div className="script-block__panel--three-columns">
                            <ToggleButtonField
                                name="action"
                                valuesEnum={BeefyActionType}
                                updateFunction={(newValue) => {
                                    update({ ...form, action: newValue });
                                }}
                                initial={form.action}
                            />
                            <ToggleButtonField
                                name="amountType"
                                valuesEnum={AmountType}
                                updateFunction={(newValue: AmountType) => {
                                    const updatedForm = {
                                        ...form,
                                        amountType: newValue,
                                        floatAmount: newValue === AmountType.Percentage ? 50 : 0
                                    };
                                    const valid = isFormValid(updatedForm);
                                    update({ ...updatedForm, valid });
                                }}
                                initial={form.amountType}
                            />

                            {form.amountType === AmountType.Absolute ? (
                                <Field
                                    name="floatAmount"
                                    component="input"
                                    type="number"
                                    placeholder="1.00"
                                >
                                    {({ input, meta }) => (
                                        <input
                                            {...input}
                                            className={`balance-block__amount ${
                                                meta.error ? "script-block__field--error" : null
                                            }`}
                                            onChange={(e) => {
                                                e.target.value =
                                                    Number(e.target.value) < 0
                                                        ? "0"
                                                        : e.target.value;
                                                input.onChange(e);
                                                const updatedForm = {
                                                    ...form,
                                                    floatAmount: Number(e.target.value)
                                                };
                                                const valid = isFormValid(updatedForm);
                                                update({ ...updatedForm, valid });
                                            }}
                                            placeholder="Amount"
                                        />
                                    )}
                                </Field>
                            ) : (
                                <div className="slider-container">
                                    <Field name="floatAmount" component="input" type="range">
                                        {({ input, meta }) => (
                                            <input
                                                min="50"
                                                max="10000"
                                                step="50"
                                                {...input}
                                                className={`${
                                                    meta.error ? "script-block__field--error" : null
                                                }`}
                                                onChange={(e) => {
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

                                    <div className="slider-container__slider-value">
                                        {`${form.floatAmount / 100}%`}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="script-block__panel--three-columns price-block">
                            <Field name="dex" component="select">
                                {({ input }) => (
                                    <select
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            const dex = dexes.find(
                                                (d) => d.poolAddress === e.target.value
                                            );
                                            setSelectedDex(dex);
                                        }}
                                        className="beefy-block__dex"
                                    >
                                        {dexes.map((dex) => (
                                            <option key={dex.poolAddress} value={dex.poolAddress}>
                                                {dex.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </Field>

                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokens.find((t) => t.address === tokenA)}
                                setSelectedToken={(token) => setTokenA(token.address)}
                            />

                            <TokensModal
                                tokens={tokens}
                                selectedToken={tokens.find((t) => t.address === tokenB)}
                                setSelectedToken={(token) => setTokenB(token.address)}
                            />
                        </div>

                        <div>
                            <div>LP Address:</div>
                            <div>
                                {loadingLP
                                    ? "Fetching LP address..."
                                    : currentLP === "0x0000000000000000000000000000000000000000"
                                    ? "This pair is not supported on this DEX"
                                    : currentLP}
                            </div>
                        </div>

                        <div>
                            <div>Beefy Vault:</div>
                            <div>
                                {!currentLP ||
                                currentLP === "0x0000000000000000000000000000000000000000" ? (
                                    "Please select a valid LP"
                                ) : GetCurrentChain(chainId!).beefyMoos[currentLP] ? (
                                    GetCurrentChain(chainId!).beefyMoos[currentLP]
                                ) : (
                                    <>
                                        <div>
                                            We could not find the address of the Beefy vault
                                            associated to this LP, so you'll have to add it manually
                                        </div>
                                        <Field name="mooAddress" component="select">
                                            {({ input, meta }) => (
                                                <input
                                                    {...input}
                                                    placeholder="Beefy Vault Address"
                                                    className={`transfer-block__token ${
                                                        meta.error
                                                            ? "script-block__field--error"
                                                            : null
                                                    }`}
                                                    onChange={(e) => {
                                                        input.onChange(e);
                                                        const updatedForm = {
                                                            ...form,
                                                            mooAddress: e.target.value
                                                        };
                                                        const valid = isFormValid(updatedForm);
                                                        update({ ...updatedForm, valid });
                                                    }}
                                                />
                                            )}
                                        </Field>
                                    </>
                                )}
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
