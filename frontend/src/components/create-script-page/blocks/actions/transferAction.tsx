import React from 'react';
import { SelectableBlock } from '../baseBlock';
import { ITransferActionForm } from './actions-interfaces';
import { Form, Field } from 'react-final-form';
import { Tokens } from '../../../../data/tokens';
import { ethers } from 'ethers';


export class TransferAction extends SelectableBlock<ITransferActionForm> {

    private amountValidation = (value: string) => {
        if (!value || value === '') return 'required';
        if (Number(value) <= 0) return 'required > 0';
        return undefined;
    };

    private tokenValidation = (value: string) => {
        if (!value || value === '') return 'required';
        return undefined;
    };

    private addressValidation = (value: string) => {
        if (!value || value === '') return 'required';
        if (!ethers.utils.isAddress(value)) return 'it does not seem a real address';
        return undefined;
    };

    protected title: string = "Transfer";
    protected content = () => {
        return (
            <Form
                initialValues={this.props.blockForm}
                onSubmit={() => { /** Individual forms are not submitted */ }}
                render={({ handleSubmit, valid }) => (
                    <form onSubmit={handleSubmit}>

                        <div className='transfer-block'>

                            <Field
                                name="tokenAddress"
                                component="select"
                                className='transfer-block__token'
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
                                >
                                    <option key={0} value="" disabled ></option>
                                    {
                                        Tokens.Kovan.map(token => (
                                            <option key={token.address} value={token.address}>
                                                {token.symbol}
                                            </option>
                                        ))
                                    }
                                </select>}
                            </Field>

                            <Field
                                name="destinationAddress"
                                component="select"
                                className='transfer-block__token'
                                validate={this.addressValidation}
                            >
                                {({ input }) =>
                                    <input
                                        {...input}
                                        onChange={(e) => {
                                            input.onChange(e);
                                            this.props.blockForm.destinationAddress = e.target.value;
                                        }}
                                        onBlur={(e) => {
                                            input.onBlur(e);
                                            this.props.blockForm.valid = valid;
                                        }}
                                    />
                                }
                            </Field>

                            <Field name="floatAmount"
                                className='balance-block__amount'
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
                                    />
                                }
                            </Field>
                        </div >
                        <pre>{JSON.stringify(this.props.blockForm)}</pre>
                    </form>
                )}
            />
        );
    };
}
