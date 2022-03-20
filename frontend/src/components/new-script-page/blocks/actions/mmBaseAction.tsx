import React from 'react';
import { IBaseMMActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { Token } from '../../../../data/tokens';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';

const amountValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (Number(value) <= 0) return 'required > 0';
    return undefined;
};

const tokenValidation = (value: string) => {
    if (!value || value === '') return 'required';
    return undefined;
};

export const MmBaseAction = ({ form, update }: { form: IBaseMMActionForm; update: (next: IBaseMMActionForm) => void; }) => {
    const tokens: Token[] = useSelector((state: RootState) => state.tokens.currentChainTokens);

    return (
        <Form
            initialValues={form}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>

                    <div className='transfer-block'>
                        <div className="script-block__panel--row">

                            <Field
                                name="tokenAddress"
                                component="select"
                                validate={tokenValidation}
                            >
                                {({ input, meta }) => <select
                                    {...input}
                                    className={`transfer-block__token-address ${meta.error ? 'script-block__field--error' : null}`}
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
                                        tokens.map(token => (
                                            <option key={token.address} value={token.address}>
                                                {token.symbol}
                                            </option>
                                        ))
                                    }
                                </select>}
                            </Field>

                            <Field name="floatAmount"
                                component="input"
                                type="number"
                                placeholder='1.00'
                                validate={amountValidation}
                            >
                                {({ input, meta }) =>
                                    <input
                                        {...input}
                                        className={`'balance-block__amount ${meta.error ? 'script-block__field--error' : null}`}
                                        onChange={(e) => {
                                            e.target.value = Number(e.target.value) < 0 ? '0' : e.target.value;
                                            input.onChange(e);
                                            update({ ...form, floatAmount: Number(e.target.value) });
                                        }}
                                        onBlur={(e) => {
                                            input.onBlur(e);
                                            update({ ...form, valid });
                                        }}
                                        placeholder="Amount"
                                    />
                                }
                            </Field>

                        </div>
                        <div>
                            TODO
                            <ul>
                                <li>Add amount type toggle (absolute/percentage)</li>
                                <li>Add action type toggle (deposit/withdraw)</li>
                                <li>Only display tokens with aToken associated</li>
                            </ul>
                        </div >
                    </div >
                </form>
            )}
        />
    );
};
