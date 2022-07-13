import React, { useState } from "react";
import { Field } from "react-final-form";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import { ToggleButtonField } from "../shared/toggle-button";
import "./amount-input.css";

interface IAmountInputProps {
    initialAmountType: AmountType;
    processNewValue: (amountType: AmountType, amount: number) => void;
}

export const AmountInput = (props: IAmountInputProps) => {
    const [amountType, setAmountType] = useState<AmountType>(props.initialAmountType);
    const [currentAmount, setAmount] = useState<number>(0);

    const absoluteAmountType = () => (
        <Field name="floatAmount" component="input" type="number" placeholder="1.00">
            {({ input, meta }) => (
                <input
                    {...input}
                    className={`block-amount__input ${
                        meta.error ? "script-block__input--error" : ""
                    }`}
                    onChange={(e) => {
                        const n = Number(e.target.value);
                        e.target.value = n < 0 ? "0" : e.target.value;
                        input.onChange(e);
                        props.processNewValue(amountType, n);
                        setAmount(n);
                    }}
                    placeholder="Amount"
                />
            )}
        </Field>
    );

    const percentageAmountType = () => (
        <div className="block-amount__slider-container">
            <Field name="floatAmount" component="input" type="range">
                {({ input, meta }) => (
                    <input
                        min="50"
                        max="10000"
                        step="50"
                        {...input}
                        className={`block-amount__slider ${
                            meta.error ? "script-block__input--error" : ""
                        }`}
                        onChange={(e) => {
                            const n = Number(e.target.value);
                            input.onChange(e);
                            props.processNewValue(amountType, n);
                            setAmount(n);
                        }}
                    />
                )}
            </Field>

            <div className="block-amount__slider-value">{`${currentAmount / 100}%`}</div>
        </div>
    );

    return (
        <div className="block-amount">
            {amountType === AmountType.Absolute ? absoluteAmountType() : percentageAmountType()}

            <Field name="amountType">
                {({ input }) => (
                    <button
                        type="button"
                        className="script-block__toggle-button"
                        onClick={(e) => {
                            input.onChange(e);
                            const newAmountType =
                                amountType === AmountType.Absolute
                                    ? AmountType.Percentage
                                    : AmountType.Absolute;
                            const newAmount = newAmountType === AmountType.Percentage ? 50 : 0;
                            props.processNewValue(newAmountType, newAmount);
                            setAmountType(newAmountType);
                            setAmount(newAmount);
                        }}
                    >
                        {amountType === AmountType.Absolute ? "Abs" : "Perc"}
                    </button>
                )}
            </Field>
        </div>
    );
};
