import React, { useEffect, useState } from "react";
import { IBeefyActionForm } from "../../../../data/chains-data/action-form-interfaces";
import { Form, Field } from "react-final-form";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state";
import { TokensModal } from "../../../../components/tokens-modal";
import { DEX, Token } from "../../../../data/chains-data/interfaces";
import { GetCurrentChain, ZeroAddress } from "../../../../data/chain-info";
import { ethers } from "ethers";
import { ToggleButtonField } from "../shared/toggle-button";
import { AmountType, BeefyActionType } from "@daemons-fi/shared-definitions/build";
import { AmountInput } from "../shared/amount-input";
import { LpInfoBox } from "../../../../components/lp-info";

const validateForm = (form: IBeefyActionForm) => {
    const errors: any = {};
    if (!form.floatAmount || (form.floatAmount as any) === "") errors.floatAmount = "required";
    if (form.floatAmount && Number(form.floatAmount) <= 0) errors.floatAmount = "required > 0";
    if (!form.lpAddress) errors.lpAddress = "required";
    if (form.lpAddress === ZeroAddress) errors.lpAddress = "invalid";
    if (!form.mooAddress || form.mooAddress === ZeroAddress) errors.mooAddress = "required";
    if (form.mooAddress && !ethers.utils.isAddress(form.mooAddress)) errors.mooAddress = "invalid";
    return errors;
};

const isFormValid = (values: IBeefyActionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const BeefyAction = ({
    form,
    update
}: {
    form: IBeefyActionForm;
    update: (next: IBeefyActionForm) => void;
}) => {
    const chainId = useSelector((state: RootState) => state.user.chainId)!;
    const tokens = GetCurrentChain(chainId!).tokens;
    const dexes = GetCurrentChain(chainId!).dexes;
    const [selectedDex, setSelectedDex] = useState<DEX>(dexes[0]);
    const [tokenA, setTokenA] = useState<Token>(tokens[0]);
    const [tokenB, setTokenB] = useState<Token>(tokens[1]);
    const [lpAddress, setLpAddress] = useState<string>(ZeroAddress);
    const [mooAddress, setMooAddress] = useState<string>(ZeroAddress);

    useEffect(() => {
        const lpName = `${tokenA.symbol}-${tokenB.symbol}-LP`;
        const updatedForm = {
            ...form,
            tokenA: tokenA.address,
            tokenB: tokenB.address,
            lpAddress,
            mooAddress,
            lpName
        };
        const valid = isFormValid(updatedForm);
        update({ ...updatedForm, valid });
    }, [tokenA, tokenB, lpAddress, mooAddress]);

    const linkToExplorer = (address: string) => (
        <div className="script-block__lp-address">
            <a href={`${GetCurrentChain(chainId).explorerUrl}token/${address}#code`}>{address}</a>
        </div>
    );

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
                        <ToggleButtonField
                            name="action"
                            valuesEnum={BeefyActionType}
                            updateFunction={(newValue) => {
                                update({ ...form, action: newValue });
                            }}
                            initial={form.action}
                        />

                        <AmountInput
                            initialAmountType={form.amountType}
                            processNewValue={(amountType: AmountType, floatAmount: number) => {
                                const updatedForm = { ...form, amountType, floatAmount };
                                const valid = isFormValid(updatedForm);
                                update({ ...updatedForm, valid });
                            }}
                        />

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
                                            setSelectedDex(dex!);
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
                                selectedToken={tokenA}
                                setSelectedToken={(token) => {
                                    if (tokenB.address === token.address) setTokenB(tokenA);
                                    setTokenA(token);
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

                        <LpInfoBox
                            showOwned={true}
                            dexRouter={selectedDex.poolAddress}
                            tokenA={tokenA}
                            tokenB={tokenB}
                            setLpAddress={setLpAddress}
                        />

                        <div>
                            <div>Beefy Vault:</div>
                            <div style={{ wordBreak: "break-word" }}>
                                {lpAddress === ZeroAddress ? (
                                    <div
                                        style={{
                                            fontSize: "0.9rem",
                                            fontStyle: "italic",
                                            marginTop: "10px"
                                        }}
                                    >
                                        Please select a valid LP
                                    </div>
                                ) : GetCurrentChain(chainId!).beefyMoos[lpAddress] ? (
                                    linkToExplorer(GetCurrentChain(chainId!).beefyMoos[lpAddress])
                                ) : (
                                    <>
                                        <div
                                            style={{
                                                fontSize: "0.9rem",
                                                fontStyle: "italic",
                                                marginTop: "10px",
                                                marginBottom: "10px"
                                            }}
                                        >
                                            We could not find the address of the Beefy vault
                                            associated to this LP, so you'll have to add it manually
                                        </div>
                                        <Field name="mooAddress" component="select">
                                            {({ input, meta }) => (
                                                <input
                                                    {...input}
                                                    placeholder="Beefy Vault Address"
                                                    className={`script-block__input ${
                                                        meta.error
                                                            ? "script-block__input--error"
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
