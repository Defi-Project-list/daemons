import React, { useState } from "react";
import { Field } from "react-final-form";
import { AmountType } from "@daemons-fi/shared-definitions/build";
import "./amount-input.css";

interface IAmountInputProps {
    initialAmountType: AmountType;
    processNewValue: (amountType: AmountType, amount: number) => void;
    inputName?: string;
    buttonName?: string;
}

export const AmountInput = (props: IAmountInputProps) => {
    const [amountType, setAmountType] = useState<AmountType>(props.initialAmountType);
    const [currentAmount, setAmount] = useState<number>(0);

    const absoluteAmountType = () => (
        <Field
            name={props.inputName ?? "floatAmount"}
            component="input"
            type="number"
            placeholder="1.00"
        >
            {({ input, meta }) => (
                <input
                    {...input}
                    className={`block-amount__input ${
                        meta.error ? "script-block__input--error" : ""
                    }`}
                    onChange={(e) => {
                        const n = Math.max(0, Number(e.target.value));
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
            <Field name={props.inputName ?? "floatAmount"} component="input" type="range">
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
                        value={currentAmount}
                    />
                )}
            </Field>

            <Field name={props.inputName ?? "floatAmount"} component="input" type="number">
                {({ input, meta }) => (
                    <div className="block-amount__percentage-group">
                        <input
                            {...input}
                            className="block-amount__percentage-input"
                            onChange={(e) => {
                                if (isNaN(Number(e.target.value))) {
                                    setAmount(50);
                                    return;
                                }

                                const rawN = Number(e.target.value);
                                const rounded = Math.round(rawN * 100) / 100;
                                const bounded = Math.max(Math.min(rounded, 100), 0.01);
                                const n = bounded * 100;

                                input.onChange(e);
                                props.processNewValue(amountType, n);
                                setAmount(n);
                            }}
                            value={`${currentAmount / 100}`}
                            placeholder="Amount"
                        />
                        %
                    </div>
                )}
            </Field>
        </div>
    );

    return (
        <div className="block-amount">
            {amountType === AmountType.Absolute ? absoluteAmountType() : percentageAmountType()}

            <Field name={props.buttonName ?? "amountType"}>
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
