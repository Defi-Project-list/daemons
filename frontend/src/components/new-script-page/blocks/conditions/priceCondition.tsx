import React, { useEffect, useState } from 'react';
import { IPriceConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';
import { IToken, Token } from '../../../../data/tokens';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';
import { TokensModal } from "../shared/tokens-modal";


const valueValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (Number(value) <= 0) return 'required > 0';
    return undefined;
};

export const PriceCondition = ({ form, update }: { form: IPriceConditionForm; update: (next: IPriceConditionForm) => void; }) => {
    const tokens: Token[] = useSelector((state: RootState) => state.tokens.currentChainTokens);
    const [filteredTokens, setFilteredTokens] = useState<IToken[]>([]);
    const [selectedToken, setSelectedToken] = useState<IToken | undefined>();

    useEffect(() => {
        const tokensWithPriceFeed = tokens.filter(token => token.hasPriceFeed);
        setFilteredTokens(tokensWithPriceFeed);
        setSelectedToken(tokensWithPriceFeed[0]);
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
                    <div className='script-block__panel--row price-block'>

                        {filteredTokens?.length > 0 && <TokensModal
                            tokens={filteredTokens}
                            selectedToken={selectedToken}
                            setSelectedToken={setSelectedToken}
                        />
                        }

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
