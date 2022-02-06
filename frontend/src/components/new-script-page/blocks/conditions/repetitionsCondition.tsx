import React from 'react';
import { IRepetitionsConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';

const repetitionsValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (Number(value) <= 0) return 'required > 0';
    return undefined;
};

export const RepetitionsCondition = ({ form, update }: { form: IRepetitionsConditionForm; update: (next: IRepetitionsConditionForm) => void; }) => {
    return (
        <Form
            initialValues={form}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className='script-block__panel--row repetitions-block'>

                        <Field name="amount"
                            component="input"
                            type="number"
                            placeholder='1'
                            step="1"
                            validate={repetitionsValidation}
                        >
                            {({ input, meta }) =>
                                <input
                                    {...input}
                                    className={`repetitions-block__ticks ${meta.error ? 'script-block__field--error' : null}`}
                                    onChange={(e) => {
                                        e.target.value = String(Number(e.target.value));
                                        e.target.value = Number(e.target.value) < 1 ? '1' : e.target.value;
                                        input.onChange(e);
                                        update({ ...form, amount: Number(e.target.value) });
                                    }}
                                    onBlur={(e) => {
                                        input.onBlur(e);
                                        update({ ...form, valid });
                                    }}
                                />
                            }
                        </Field>

                    </div >
                    <pre>{JSON.stringify(form, null, ' ')}</pre>
                </form>
            )}
        />
    );
};
