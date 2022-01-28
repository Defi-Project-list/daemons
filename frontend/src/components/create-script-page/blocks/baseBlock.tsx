import React, { Component, ReactNode } from 'react';
import { Form, Field } from 'react-final-form';

interface ISelectableBlockProps<T> {
    selected?: boolean;
    showSelectionCheckbox?: boolean;
    blockForm: T,
    chainId?: string;
}

export abstract class SelectableBlock<T, S = {}> extends Component<ISelectableBlockProps<T>, S> {

    protected abstract title: string;
    protected abstract content: () => ReactNode;

    public render(): ReactNode {
        const selected = this.props.selected;
        return (
            <div className={`script-block ${selected ? "script-block--selected" : ""} `}>
                <div className='script-block__accordion'>
                    <div className='script-block__title'>{this.title}</div>
                    {
                        this.props.showSelectionCheckbox ?
                            <input type="checkbox"
                                name="enabled"
                                className='script-block__selection-checkbox'
                                checked={this.props.selected}
                                onChange={() => {/** Do nothing, updated by the parent */ }}
                            />
                            : null
                    }
                </div>
                <div onClick={(e) => e.stopPropagation()} className='script-block__panel'>
                    {selected ? this.content() : null}
                </div>
            </div >
        );
    }

}
