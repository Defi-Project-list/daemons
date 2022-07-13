import React, { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import { IFrequencyConditionForm } from "../../../../data/chains-data/condition-form-interfaces";

const validateForm = (form: IFrequencyConditionForm) => {
    const errors: any = {};
    if (!form.ticks || (form.ticks as any) === "") {
        errors.ticks = "required";
    }
    if (form.ticks && Number(form.ticks) <= 0) {
        errors.ticks = "required > 0";
    }
    return errors;
};

const isFormValid = (values: IFrequencyConditionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const FrequencyCondition = ({
    form,
    update
}: {
    form: IFrequencyConditionForm;
    update: (next: IFrequencyConditionForm) => void;
}) => {
    const getNextExecution = (form: IFrequencyConditionForm) => {
        const frequency = form.ticks * form.unit;
        return new Date(Date.now() + frequency * 1000);
    };
    const getSecondExecution = (form: IFrequencyConditionForm) => {
        const firstExecutionTimestamp = form.startNow
            ? Date.now()
            : Date.parse(getNextExecution(form).toISOString());
        const frequency = form.ticks * form.unit;
        return new Date(firstExecutionTimestamp + frequency * 1000);
    };

    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => {
                /** Individual forms are not submitted */
            }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>
                    <div className="frequency-block">
                        <div className="repetitions-block__sentence">
                            <span>Execute every</span>{" "}
                            <Field
                                name="ticks"
                                component="input"
                                type="number"
                                placeholder="0"
                                step="1"
                            >
                                {({ input, meta }) => (
                                    <input
                                        {...input}
                                        className={`frequency-block__ticks ${
                                            meta.error ? "script-block__input--error" : null
                                        }`}
                                        style={{ width: "7px" }} // changed onInput
                                        onInput={(e) => {
                                            const target = e.target as HTMLInputElement;
                                            target.style.width = `${
                                                Math.max(target.value.length, 1) * 7
                                            }px`;
                                        }}
                                        onChange={(e) => {
                                            e.target.value = String(Number(e.target.value));
                                            e.target.value =
                                                Number(e.target.value) < 1 ? "1" : e.target.value;
                                            input.onChange(e);
                                            const updatedForm = {
                                                ...form,
                                                ticks: Number(e.target.value)
                                            };
                                            const valid = isFormValid(updatedForm);
                                            update({ ...updatedForm, valid });
                                        }}
                                    />
                                )}
                            </Field>{" "}
                            <Field name="unit" component="select">
                                {({ input }) => (
                                    <select
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            update({ ...form, unit: Number(e.target.value) });
                                        }}
                                        className="frequency-block__time-unit"
                                    >
                                        <option value={1}>Seconds</option>
                                        <option value={60}>Minutes</option>
                                        <option value={3600}>Hours</option>
                                        <option value={86400}>Days</option>
                                        <option value={604800}>Weeks</option>
                                    </select>
                                )}
                            </Field>
                        </div>

                        <div className="script-block__panel--row">
                            <label htmlFor="id-start-immediately-frequency">
                                Starting immediately
                            </label>

                            <Field name="startNow" type="checkbox">
                                {({ input }) => (
                                    <input
                                        id="id-start-immediately-frequency"
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            update({ ...form, startNow: e.target.checked });
                                        }}
                                        className="frequency-block__starting-point"
                                    />
                                )}
                            </Field>
                        </div>

                        <br />
                        <div className="script-block__info">
                            <div>Condition will trigger</div>
                            {form.startNow ? " now" : getNextExecution(form).toLocaleString()}.
                        </div>
                        <div className="script-block__info">
                            <div>And then</div>
                            {getSecondExecution(form).toLocaleString()}.
                        </div>
                    </div>
                </form>
            )}
        />
    );
};
