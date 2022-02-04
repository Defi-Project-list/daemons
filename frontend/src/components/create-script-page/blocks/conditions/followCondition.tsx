import React from 'react';
import { SelectableBlock } from '../baseBlock';
import { IFollowConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';

export class FollowCondition extends SelectableBlock<IFollowConditionForm> {

    private scriptSelectValidation = (value: string) => {
        if (!value || value === '') return 'required';
        return undefined;
    };

    protected title: string = "Execute After";
    protected content = () => {
        return (
            <Form
                initialValues={this.props.blockForm}
                onSubmit={() => { /** Individual forms are not submitted */ }}
                render={({ handleSubmit, valid }) => (
                    <form onSubmit={handleSubmit}>
                        <div className='script-block__panel--row follow-block'>

                            <Field
                                name="unit"
                                component="select"
                                validate={this.scriptSelectValidation}
                            >
                                {({ input }) => <select
                                    {...input}
                                    onChange={(e) => {
                                        input.onChange(e);
                                        // this.props.blockForm.parentId = e.target.value;
                                    }}
                                    className='follow-block__parent'
                                >
                                    <option value={'0x00'}>To be added..</option>
                                </select>}
                            </Field>
                        </div >
                        {/* <pre>{JSON.stringify(this.props.blockForm)}</pre> */}
                    </form>
                )}
            />
        );
    };
}
