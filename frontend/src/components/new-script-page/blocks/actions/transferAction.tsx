import React from 'react';
import { ITransferActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { ethers } from 'ethers';
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

const addressValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (!ethers.utils.isAddress(value)) return 'it does not seem a real address';
    return undefined;
};

export const TransferAction = ({ form, update }: { form: ITransferActionForm; update: (next: ITransferActionForm) => void; }) => {
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

                        <Field
                            name="destinationAddress"
                            component="select"
                            validate={addressValidation}
                        >
                            {({ input, meta }) =>
                                <input
                                    {...input}
                                    placeholder="Destination Address"
                                    className={`transfer-block__token ${meta.error ? 'script-block__field--error' : null}`}
                                    onChange={(e) => {
                                        input.onChange(e);
                                        update({ ...form, destinationAddress: e.target.value });
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
