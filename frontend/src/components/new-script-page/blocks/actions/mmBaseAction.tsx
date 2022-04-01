import React, { useEffect, useState } from 'react';
import { IBaseMMActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { IToken } from '../../../../data/tokens';
import { TokensModal } from "../shared/tokens-modal";
import { ToggleButtonField } from '../shared/toggle-button';
import { BaseMoneyMarketActionType } from '../../../../../../shared-definitions/scripts/mm-base-action-messages';


const amountValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (Number(value) <= 0) return 'required > 0';
    return undefined;
};

export const MmBaseAction = ({ form, update }: { form: IBaseMMActionForm; update: (next: IBaseMMActionForm) => void; }) => {
    const tokens = form.moneyMarket.supportedTokens;
    const [selectedToken, setSelectedToken] = useState<IToken | undefined>();

    useEffect(() => {
        setSelectedToken(tokens[0]);
    }, [tokens]);

    useEffect(() => {
        if (selectedToken)
            update({ ...form, tokenAddress: selectedToken.address });
    }, [selectedToken]);

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
                                selectedToken={selectedToken}
                                setSelectedToken={setSelectedToken}
                            />

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
