import React from 'react';
import { IPriceConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';
import { Token } from '../../../../data/tokens';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';


const tokenValidation = (value: string) => {
    if (!value || value === '') return 'required';
    return undefined;
};

const valueValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (Number(value) <= 0) return 'required > 0';
    return undefined;
};

export const PriceCondition = ({ form, update }: { form: IPriceConditionForm; update: (next: IPriceConditionForm) => void; }) => {
    const tokens: Token[] = useSelector((state: RootState) => state.tokens.currentChainTokens);

    return (
        <Form
            initialValues={form}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>
                    <div className='script-block__panel--row price-block'>

                        <Field
                            name="tokenAddress"
                            component="select"
                            validate={tokenValidation}
                        >
                            {({ input, meta }) => <select
                                {...input}
                                className={`price-block__token-address ${meta.error ? 'script-block__field--error' : null}`}
                                onChange={(e) => {
                                    input.onChange(e);
                                    update({ ...form, tokenAddress: e.target.value });
                                }}
                                onBlur={(e) => {
                                    input.onBlur(e);
                                    update({ ...form, valid });
                                }}
                            >
                                <option key={0} value="" disabled ></option>
                                {
                                    tokens
                                        .filter(token => token.hasPriceFeed)
                                        .map(token => (
                                            <option key={token.address} value={token.address}>
                                                {token.symbol}
                                            </option>
                                        ))
                                }
                            </select>}
                        </Field>

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
                                className='price-block__comparison'
                            >
                                <option value={0}>&gt;</option>
                                <option value={1}>&lt;</option>
                            </select>}
                        </Field>

                        <Field name="floatValue"
                            component="input"
                            type="number"
                            placeholder='1.00'
                            validate={valueValidation}
                        >
                            {({ input, meta }) =>
                                <input
                                    {...input}
                                    className={`price-block__value ${meta.error ? 'script-block__field--error' : null}`}
                                    onChange={(e) => {
                                        e.target.value = Number(e.target.value) < 0 ? '0' : e.target.value;
                                        input.onChange(e);
                                        update({ ...form, floatValue: Number(e.target.value) });
                                    }}
                                    onBlur={(e) => {
                                        input.onBlur(e);
                                        update({ ...form, valid });
                                    }}
                                />
                            }
                        </Field>

                    </div>
                </form>
            )}
        />
    );

};
