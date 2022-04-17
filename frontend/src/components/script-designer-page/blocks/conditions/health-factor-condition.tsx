import React from 'react'
import { Form, Field } from 'react-final-form';
import { IHealthFactorConditionForm } from "../../../../data/chains-data/condition-form-interfaces";


const validateForm = (form: IHealthFactorConditionForm) => {
    const errors: any = {};
    if (!form.floatAmount || (form.floatAmount as any) === '') {
        errors.floatAmount = 'required';
    }
    if (form.floatAmount && Number(form.floatAmount) <= 0) {
        errors.floatAmount = 'required > 0';
    }
    return errors;
};

const isFormValid = (values: IHealthFactorConditionForm) => {
    const errors = validateForm(values);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
};

export const HealthFactorCondition = ({ form, update }: { form: IHealthFactorConditionForm; update: (next: IHealthFactorConditionForm) => void; }) => {
    return (
        <Form
            initialValues={form}
            validate={validateForm}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <div className='script-block__panel--two-columns balance-block'>

                        <Field
                            name="comparison"
                            component="select"
                        >
                            {({ input }) => <select
                                {...input}
                                onChange={(e) => {
                                    input.onChange(e);
                                    update({ ...form, comparison: Number(e.target.value) });
                                }}
                                className='balance-block__comparison'
                            >
                                <option value={0}>&gt;</option>
                                <option value={1}>&lt;</option>
                            </select>}
                        </Field>

                        <Field name="floatAmount"
                            component="input"
                            type="number"
                            placeholder='1.00'
                        >
                            {({ input, meta }) =>
                                <input
                                    {...input}
                                    className={`balance-block__amount ${meta.error ? 'script-block__field--error' : null}`}
                                    onChange={(e) => {
                                        e.target.value = Number(e.target.value) < 0 ? '0' : e.target.value;
                                        input.onChange(e);
                                        const updatedForm = { ...form, floatAmount: Number(e.target.value) };
                                        const valid = isFormValid(updatedForm);
                                        update({ ...updatedForm, valid });
                                    }}
                                />
                            }
                        </Field>

                        {/* ENABLE WHEN DEBUGGING!  */}
                        {/* <p>{JSON.stringify(form, null, ' ')}</p> */}
                    </div>
                </form>
            )}
        />
    );
};
