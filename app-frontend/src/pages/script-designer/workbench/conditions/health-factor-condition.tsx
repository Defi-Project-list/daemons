import { MoneyMarketABI } from "@daemons-fi/contracts";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import { RootState, useAppSelector } from "../../../../state";
import { IHealthFactorConditionForm } from "../../../../data/chains-data/condition-form-interfaces";
import { bigNumberToFloat } from "@daemons-fi/contracts";

const validateForm = (form: IHealthFactorConditionForm) => {
    const errors: any = {};
    if (!form.floatAmount || (form.floatAmount as any) === "") {
        errors.floatAmount = "required";
    }
    if (form.floatAmount && Number(form.floatAmount) <= 0) {
        errors.floatAmount = "required > 0";
    }
    return errors;
};

const isFormValid = (values: IHealthFactorConditionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

const fetchCurrentHealthFactor = async (
    walletAddress: string,
    mmAddress: string
): Promise<number> => {
    // Get MM contract
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const moneyMarket = new ethers.Contract(mmAddress, MoneyMarketABI, provider);

    // get HF and format
    const currentHealthFactor = (await moneyMarket.getUserAccountData(walletAddress))[5];
    return bigNumberToFloat(currentHealthFactor);
};

export const HealthFactorCondition = ({
    form,
    update
}: {
    form: IHealthFactorConditionForm;
    update: (next: IHealthFactorConditionForm) => void;
}) => {
    const walletAddress = useAppSelector((state: RootState) => state.user.address);
    const [currentHealthFactor, setCurrentHealthFactor] = useState<number | undefined>(undefined);

    useEffect(() => {
        fetchCurrentHealthFactor(walletAddress!, form.contractAddress).then((hf) =>
            setCurrentHealthFactor(hf)
        );
    }, []);

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => {
                /** Individual forms are not submitted */
            }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className="script-block__panel--two-columns balance-block">
                        <Field name="comparison" component="select">
                            {({ input }) => (
                                <select
                                    {...input}
                                    onChange={(e) => {
                                        input.onChange(e);
                                        update({ ...form, comparison: Number(e.target.value) });
                                    }}
                                    className="balance-block__comparison"
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
                                        meta.error ? "script-block__input--error" : ""
                                    }`}
                                    onChange={(e) => {
                                        if (Number(e.target.value) < 0) e.target.value = "0";
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

                    <br />
                    <div>
                        {currentHealthFactor === undefined
                            ? `..fetching current health factor..`
                            : `Current health factor: ${currentHealthFactor}`}
                    </div>

                    {/* ENABLE WHEN DEBUGGING!  */}
                    {/* <p>{JSON.stringify(form, null, ' ')}</p> */}
                </form>
            )}
        />
    );
};
