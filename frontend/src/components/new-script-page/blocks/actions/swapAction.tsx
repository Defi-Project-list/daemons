import React, { useEffect, useState } from 'react';
import { ISwapActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { IToken, Token } from '../../../../data/tokens';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state';
import { TokensModal } from "../shared/tokens-modal";


const amountValidation = (value: string) => {
    if (!value || value === '') return 'required';
    if (Number(value) <= 0) return 'required > 0';
    return undefined;
};

export const SwapAction = ({ form, update }: { form: ISwapActionForm; update: (next: ISwapActionForm) => void; }) => {
    const tokens: Token[] = useSelector((state: RootState) => state.tokens.currentChainTokens);
    const [selectedTokenFrom, setSelectedTokenFrom] = useState<IToken | undefined>();
    const [selectedTokenTo, setSelectedTokenTo] = useState<IToken | undefined>();

    useEffect(() => {
        if (tokens?.length > 2) {
            const initialTokenFrom = tokens[0];
            const initialTokenTo = tokens[1];
            setSelectedTokenFrom(initialTokenFrom);
            setSelectedTokenTo(initialTokenTo);
            update({
                ...form,
                tokenFromAddress: initialTokenFrom.address,
                tokenToAddress: initialTokenTo.address
            });
        }
    }, [tokens]);

    const onSetSelectedTokenFrom = (tokenFrom: IToken) => {
        if (tokenFrom.address !== selectedTokenTo?.address) {
            update({ ...form, tokenFromAddress: tokenFrom.address });
            setSelectedTokenFrom(tokenFrom);
        }
    };
    const onSetSelectedTokenTo = (tokenTo: IToken) => {
        if (tokenTo.address !== selectedTokenFrom?.address) {
            update({ ...form, tokenToAddress: tokenTo.address });
            setSelectedTokenTo(tokenTo);
        }
    };

    return (
        <Form
            initialValues={form}
            onSubmit={() => { /** Individual forms are not submitted */ }}
            render={({ handleSubmit, valid }) => (
                <form onSubmit={handleSubmit}>

                    <div className='swap-block'>
                        <div className='script-block__panel--row'>
                            <TokensModal
                                tokens={tokens.filter(t => t.address !== selectedTokenTo?.address)}
                                selectedToken={selectedTokenFrom}
                                setSelectedToken={onSetSelectedTokenFrom}
                            />

                            <TokensModal
                                tokens={tokens.filter(t => t.address !== selectedTokenFrom?.address)}
                                selectedToken={selectedTokenTo}
                                setSelectedToken={onSetSelectedTokenTo}
                            />
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
