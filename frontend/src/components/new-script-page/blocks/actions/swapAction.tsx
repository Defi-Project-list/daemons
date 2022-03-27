import React from 'react';
import { ISwapActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { Token } from '../../../../data/tokens';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';
import { TokensModal } from "../../../tokens-modal";

const amountValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (Number(value) <= 0) return 'required > 0';
    return undefined;
};

const tokenValidation = (value: string) => {
    if (!value || value === '') return 'required';
    return undefined;
};

export const SwapAction = ({ form, update }: { form: ISwapActionForm; update: (next: ISwapActionForm) => void; }) => {
    const tokens: Token[] = useSelector((state: RootState) => state.tokens.currentChainTokens);

    const setFromAddressToken = (value: string) => {
        update({ ...form, tokenFromAddress: value });
    }
    const setToAddressToken = (value: string) => {
        update({ ...form, tokenToAddress: value });
    }

    return (
        <Form
            initialValues={form}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>

                    <div className='swap-block'>
                        <div className='script-block__panel--row'>
                            <TokensModal
                                tokens={tokens}
                                setFormToken={setFromAddressToken} />

                            <TokensModal
                                tokens={tokens}
                                setFormToken={setToAddressToken} />
                        </div>
                        <div className='script-block__panel--row'>
                            <Field name="floatAmount"
                                component="input"
                                type="number"
                                placeholder='1.00'
                                validate={amountValidation}
                            >
                                {({ input, meta }) =>
                                    <input
                                        {...input}
                                        className={`balance-block__amount ${meta.error ? 'script-block__field--error' : null}`}
                                        onChange={(e) => {
                                            e.target.value = Number(e.target.value) < 0 ? '0' : e.target.value;
                                            input.onChange(e);
                                            update({ ...form, floatAmount: Number(e.target.value) });
                                        }}
                                        onBlur={(e) => {
                                            input.onBlur(e);
                                            update({ ...form, valid });
                                        }}
                                    />
                                }
                            </Field>
                        </div>
                        <div>
                            TODO
                            <ul>
                                <li>Add amount type toggle (absolute/percentage)</li>
                            </ul>
                        </div >
                    </div >
                </form>
            )}
        />
    );
};
