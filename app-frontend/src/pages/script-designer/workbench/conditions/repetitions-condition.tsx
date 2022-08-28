import React from "react";
import { Form, Field } from "react-final-form";
import { IRepetitionsConditionForm } from "../../../../data/chains-data/condition-form-interfaces";

const validateForm = (form: IRepetitionsConditionForm) => {
    const errors: any = {};
    if (!form.amount || (form.amount as any) === "") {
        errors.amount = "required";
    }
    if (form.amount && Number(form.amount) <= 0) {
        errors.amount = "required > 0";
    }
    return errors;
};

const isFormValid = (values: IRepetitionsConditionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const RepetitionsCondition = ({
    form,
    update
}: {
    form: IRepetitionsConditionForm;
    update: (next: IRepetitionsConditionForm) => void;
}) => {
    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => {
                /** Individual forms are not submitted */
            }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="script-block__panel--row repetitions-block">
                        <div className="repetitions-block__sentence">
                            <span>The script should be executed </span>
                            <br />

                            <Field
                                name="amount"
                                component="input"
                                type="number"
                                placeholder="1"
                                step="1"
                            >
                                {({ input, meta }) => (
                                    <input
                                        {...input}
                                        className={`repetitions-block__ticks ${
                                            meta.error ? "repetitions-block__ticks--error" : ""
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
                                                Number(e.target.value) < 0 ? "0" : e.target.value;
                                            input.onChange(e);
                                            const updatedForm = {
                                                ...form,
                                                amount: Number(e.target.value)
                                            };
                                            const valid = isFormValid(updatedForm);
                                            update({ ...updatedForm, valid });
                                        }}
                                    />
                                )}
                            </Field>

                            <span> times</span>
                        </div>
                    </div>
                </form>
            )}
        />
    );
};
