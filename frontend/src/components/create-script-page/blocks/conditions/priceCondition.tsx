import React from 'react';
import { SelectableBlock } from '../baseBlock';
import { IPriceConditionForm } from './conditions-interfaces';
import { Form, Field } from 'react-final-form';
import { IToken } from '../../../../data/tokens';
import { StorageProxy } from '../../../../data/storage-proxy';

interface IPriceConditionState {
    tokens?: IToken[];
}
export class PriceCondition extends SelectableBlock<IPriceConditionForm, IPriceConditionState> {

    componentDidMount() {
        this.fetchTokens();
    }

    private tokenValidation = (value: string) => {
        if (!value || value === '') return 'required';
        return undefined;
    };

    private valueValidation = (value: string) => {
        if (!value || value === '') return 'required';
        if (Number(value) <= 0) return 'required > 0';
        return undefined;
    };

    fetchTokens = async () => {
        const tokens = await StorageProxy.fetchTokens(this.props.chainId);
        this.setState({
            tokens: tokens
        });
    };

    protected title: string = "Token Price";
    protected content = () => {
        return (
            <Form
                initialValues={this.props.blockForm}
                onSubmit={() => { /** Individual forms are not submitted */ }}
                render={({ handleSubmit, valid }) => (
                    <form onSubmit={handleSubmit}>
                        <div className='script-block__panel--row price-block'>


                            <Field
                                name="tokenAddress"
                                component="select"
                                validate={this.tokenValidation}
                            >
                                {({ input }) => <select
                                    {...input}
                                    onChange={(e) => {
                                        input.onChange(e);
                                        this.props.blockForm.tokenAddress = e.target.value;
                                    }}
                                    onBlur={(e) => {
                                        input.onBlur(e);
                                        this.props.blockForm.valid = valid;
                                    }}
                                    className='price-block__token-address'
                                >
                                    <option key={0} value="" disabled ></option>
                                    {
                                        this.state.tokens && this.state.tokens.map(token => (
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
                                        this.props.blockForm.comparison = Number(e.target.value);
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
                                validate={this.valueValidation}
                            >
                                {({ input }) =>
                                    <input
                                        {...input}
                                        onChange={(e) => {
                                            e.target.value = Number(e.target.value) < 0 ? '0' : e.target.value;
                                            input.onChange(e);
                                            this.props.blockForm.floatValue = Number(e.target.value);
                                        }}
                                        onBlur={(e) => {
                                            input.onBlur(e);
                                            this.props.blockForm.valid = valid;
                                        }}
                                        className='price-block__value'
                                    />
                                }
                            </Field>

                        </div>
                        {/* <pre>{JSON.stringify(this.props.blockForm)}</pre> */}
                    </form>
                )}
            />
        );
    };
}
