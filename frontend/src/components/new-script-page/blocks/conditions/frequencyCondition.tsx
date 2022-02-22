import React from 'react';
import { IFrequencyConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';

const ticksValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (Number(value) <= 0) return 'required > 0';
    return undefined;
};

export const FrequencyCondition = ({ form, update }: { form: IFrequencyConditionForm; update: (next: IFrequencyConditionForm) => void; }) => {

    return (
        <Form
            initialValues={form}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>
                    <div className='script-block__panel--row frequency-block'>

                        <Field name="ticks"
                            component="input"
                            type="number"
                            placeholder='0'
                            step="1"
                            validate={ticksValidation}
                        >
                            {({ input, meta }) =>
                                <input
                                    {...input}
                                    className={`frequency-block__ticks ${meta.error ? 'script-block__field--error' : null}`}
                                    onChange={(e) => {
                                        e.target.value = String(Number(e.target.value));
                                        e.target.value = Number(e.target.value) < 1 ? '1' : e.target.value;
                                        input.onChange(e);
                                        update({ ...form, ticks: Number(e.target.value) });
                                    }}
                                    onBlur={(e) => {
                                        input.onBlur(e);
                                        update({ ...form, valid });
                                    }}
                                />
                            }
                        </Field>

                        <Field
                            name="unit"
                            component="select"
                        >
                            {({ input }) => <select
                                {...input}
                                onChange={(e) => {
                                    input.onChange(e);
                                    update({ ...form, unit: Number(e.target.value) });
                                }}
                                className='frequency-block__time-unit'
                            >
                                <option value={1}>Seconds</option>
                                <option value={60}>Minutes</option>
                                <option value={3600}>Hours</option>
                                <option value={86400}>Days</option>
                                <option value={604800}>Weeks</option>
                            </select>}
                        </Field>

                        <Field
                            name="startNow"
                            type="checkbox"
                        >
                            {({ input }) => <input
                                {...input}
                                onChange={(e) => {
                                    input.onChange(e);
                                    update({ ...form, startNow: e.target.checked });
                                }}
                                className='frequency-block__starting-point'
                            />}
                        </Field>

                    </div >
                </form>
            )}
        />
    );
};
