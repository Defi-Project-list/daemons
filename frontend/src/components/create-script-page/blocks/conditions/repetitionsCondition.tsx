import React from 'react';
import { SelectableBlock } from '../baseBlock';
import { IRepetitionsConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';

export class RepetitionsCondition extends SelectableBlock<IRepetitionsConditionForm> {

    private repetitionsValidation = (value: string) => {
        if (!value || value === '') return 'required';
        if (Number(value) <= 0) return 'required > 0';
        return undefined;
    };

    protected title: string = "Repetitions";
    protected content = () => {
        return (
            <Form
                initialValues={this.props.blockForm}
                onSubmit={() => { /** Individual forms are not submitted */ }}
                render={({ handleSubmit, valid }) => (
                    <form onSubmit={handleSubmit}>
                        <div className='script-block__panel--row repetitions-block'>

                            <Field name="repetitions"
                                component="input"
                                type="number"
                                initialValue={String(this.props.blockForm.amount)}
                                placeholder='9999'
                                step="1"
                                validate={this.repetitionsValidation}
                            >
                                {({ input }) =>
                                    <input
                                        {...input}
                                        onChange={(e) => {
                                            let amount = Math.round(Number(e.target.value));
                                            amount = amount < 1 ? 1 : amount;
                                            e.target.value = String(amount);
                                            input.onChange(e);
                                            this.props.blockForm.amount = amount;
                                        }}
                                        onBlur={(e) => {
                                            input.onBlur(e);
                                            this.props.blockForm.valid = valid;
                                        }}
                                        className='repetitions-block__ticks'
                                    />
                                }
                            </Field>

                        </div >
                        <pre>{JSON.stringify(this.props.blockForm, null, ' ')}</pre>
                    </form>
                )}
            />
        );
    };
}
