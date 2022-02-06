import React from 'react';
import { IFollowConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';
import { BaseScript } from '../../../../data/script/base-script';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';

const scriptSelectValidation = (value: any) => value ? undefined : 'required';

export const FollowCondition = ({ form, update }: { form: IFollowConditionForm; update: (next: IFollowConditionForm) => void; }) => {
    const userScripts: BaseScript[] = useSelector((state: RootState) => state.script.userScripts);

    return (
        <Form
            initialValues={form}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>
                    <div className='script-block__panel--row follow-block'>

                        <Field
                            name="unit"
                            component="select"
                            validate={scriptSelectValidation}
                        >
                            {({ input, meta }) => <select
                                {...input}
                                className={`follow-block__parent ${meta.error ? 'script-block__field--error' : null}`}
                                onChange={(e) => {
                                    input.onChange(e);
                                    //update({ ...form, parentScript: e.target.value });
                                }}
                                onBlur={(e) => {
                                    input.onBlur(e);
                                    update({ ...form, valid });
                                }}
                            >
                                <option key={0} value="" disabled ></option>
                                {
                                    userScripts.map(script => <option key={script.getId()} value={script.getId()}>{script.getId().substring(0, 16) + '...'}</option>)
                                }
                            </select>}
                        </Field>
                    </div >
                    <pre>{JSON.stringify(form, null, ' ')}</pre>
                </form>
            )}
        />
    );
};
