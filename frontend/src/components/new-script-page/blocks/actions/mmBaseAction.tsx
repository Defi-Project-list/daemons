import React from 'react';
import { IBaseMMActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { Token } from '../../../../data/tokens';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';
import { TokensModal } from "../../../tokens-modal";
import { ToggleButtonField } from '../shared/toggle-button';
import { BaseMoneyMarketActionType } from '../../../../../../shared-definitions/scripts/mm-base-action-messages';


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

    const setFormToken = (value: string) => {
        update({ ...form, tokenAddress: value });
    }

    return (
        <Form
            initialValues={form}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>

                    <div className='transfer-block'>
                        <div className="script-block__panel--row">
                            <ToggleButtonField
                                name='actionType'
                                valuesEnum={BaseMoneyMarketActionType}
                                updateFunction={(newValue) => { update({ ...form, actionType: newValue }); }}
                                initial={form.actionType}
                            />
                        </div>

                        <div className="script-block__panel--row">

                            <TokensModal
                                tokens={tokens}
                                setFormToken={setFormToken} />

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
                                        placeholder="Amount"
                                    />
                                }
                            </Field>

                        </div>
                        <div>
                            TODO
                            <ul>
                                <li>Add amount type toggle (absolute/percentage)</li>
                                <li>Only display tokens with aToken associated</li>
                            </ul>
                        </div >
                    </div >
                </form>
            )}
        />
    );
};
