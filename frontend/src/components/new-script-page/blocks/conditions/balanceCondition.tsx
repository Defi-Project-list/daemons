import React from 'react';
import { IBalanceConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';
import { Token } from '../../../../data/tokens';
import { TokensModal } from "../../../tokens-modal";

const tokenValidation = (value: string) => {
    if (!value || value === '') return 'required';
    return undefined;
};

const amountValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (Number(value) <= 0) return 'required > 0';
    return undefined;
};

export const BalanceCondition = ({ form, update }: { form: IBalanceConditionForm; update: (next: IBalanceConditionForm) => void; }) => {
    const tokens: Token[] = useSelector((state: RootState) => state.tokens.currentChainTokens);

    const setFormToken = (value: string) => {
        update({ ...form, tokenAddress: value });
    }

    return (
        <Form
            initialValues={form}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>
                    <div className='script-block__panel--row balance-block'>

                        <TokensModal
                            tokens={tokens}
                            setFormToken={setFormToken} />

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
                                className='balance-block__comparison'
                            >
                                <option value={0}>&gt;</option>
                                <option value={1}>&lt;</option>
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
                </form>
            )}
        />
    );
};
