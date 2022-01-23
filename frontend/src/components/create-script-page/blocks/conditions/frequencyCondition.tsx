import React from 'react';
import { SelectableBlock } from '../baseBlock';
import { IFrequencyConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';

export class FrequencyCondition extends SelectableBlock<IFrequencyConditionForm> {

    private ticksValidation = (value: string) => {
        if (!value || value === '') return 'required';
        if (Number(value) <= 0) return 'required > 0';
        return undefined;
    };

    protected title: string = "Frequency";
    protected content = () => {
        return (
            <Form
                initialValues={this.props.blockForm}
                onSubmit={() => { /** Individual forms are not submitted */ }}
                render={({ handleSubmit, valid }) => (
                    <form onSubmit={handleSubmit}>
                        <div className='script-block__panel--row frequency-block'>

                            <Field name="ticks"
                                component="input"
                                type="number"
                                placeholder='0'
                                step="1"
                                validate={this.ticksValidation}
                            >
                                {({ input }) =>
                                    <input
                                        {...input}
                                        onChange={(e) => {
                                            e.target.value = Number(e.target.value) < 0 ? '0' : e.target.value;
                                            input.onChange(e);
                                            this.props.blockForm.ticks = Number(e.target.value);
                                        }}
                                        onBlur={(e) => {
                                            input.onBlur(e);
                                            this.props.blockForm.valid = valid;
                                        }}
                                        className='frequency-block__ticks'
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
                                        this.props.blockForm.unit = Number(e.target.value);
                                    }}
                                    className='frequency-block__time-unit'
                                >
                                    <option value={604800}>Seconds</option>
                                    <option value={10080}>Minutes</option>
                                    <option value={168}>Hours</option>
                                    <option value={7}>Days</option>
                                    <option value={1}>Weeks</option>
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
                                        this.props.blockForm.startNow = e.target.checked;
                                    }}
                                    className='frequency-block__starting-point'
                                />}
                            </Field>

                        </div >
                        {/* <pre>{JSON.stringify(this.props.blockForm)}</pre> */}
                    </form>
                )}
            />
        );
    };
}
