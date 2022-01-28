import React from 'react';
import { SelectableBlock } from '../baseBlock';
import { ISwapActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { StorageProxy } from '../../../../data/storage-proxy';
import { IToken } from '../../../../data/tokens';

interface ISwapActionState {
    tokens?: IToken[];
}

export class SwapAction extends SelectableBlock<ISwapActionForm, ISwapActionState> {

    componentDidMount() {
        this.fetchTokens();
    }

    private amountValidation = (value: string) => {
        if (!value || value === '') return 'required';
        if (Number(value) <= 0) return 'required > 0';
        return undefined;
    };

    private tokenValidation = (value: string) => {
        if (!value || value === '') return 'required';
        return undefined;
    };

    fetchTokens = async () => {
        const tokens = await StorageProxy.fetchTokens(this.props.chainId);
        this.setState({
            tokens: tokens
        });
    };

    protected title: string = "Swap";
    protected content = () => {
        return (
            <Form
                initialValues={this.props.blockForm}
                onSubmit={() => { /** Individual forms are not submitted */ }}
                render={({ handleSubmit, valid }) => (
                    <form onSubmit={handleSubmit}>

                        <div className='swap-block'>
                            <div className='script-block__panel--row'>
                                <Field
                                    name="tokenFromAddress"
                                    component="select"
                                    validate={this.tokenValidation}
                                >
                                    {({ input }) => <select
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            this.props.blockForm.tokenFromAddress = e.target.value;
                                        }}
                                        onBlur={(e) => {
                                            input.onBlur(e);
                                            this.props.blockForm.valid = valid;
                                        }}
                                        className='swap-block__token-from-address'
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
                                    name="tokenToAddress"
                                    component="select"
                                    validate={this.tokenValidation}
                                >
                                    {({ input }) => <select
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            this.props.blockForm.tokenToAddress = e.target.value;
                                        }}
                                        onBlur={(e) => {
                                            input.onBlur(e);
                                            this.props.blockForm.valid = valid;
                                        }}
                                        className='swap-block__token-to-address'
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
                            </div>

                            <Field name="floatAmount"
                                component="input"
                                type="number"
                                placeholder='1.00'
                                validate={this.amountValidation}
                            >
                                {({ input }) =>
                                    <input
                                        {...input}
                                        onChange={(e) => {
                                            e.target.value = Number(e.target.value) < 0 ? '0' : e.target.value;
                                            input.onChange(e);
                                            this.props.blockForm.floatAmount = Number(e.target.value);
                                        }}
                                        onBlur={(e) => {
                                            input.onBlur(e);
                                            this.props.blockForm.valid = valid;
                                        }}
                                        className='balance-block__amount'
                                    />
                                }
                            </Field>
                        </div >
                        <pre>{JSON.stringify(this.props.blockForm, null, ' ')}</pre>
                    </form>
                )}
            />
        );
    };
}
