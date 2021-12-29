import React, { Component, ReactNode } from 'react';

interface ISelectableBlockProps {
    selected?: boolean;
}

export abstract class SelectableBlock extends Component<ISelectableBlockProps> {

    protected abstract title: string;
    protected abstract content: () => ReactNode;

    public render(): ReactNode {
        const selected = this.props.selected;
        return (
            <div className={`script-block ${selected ? "script-block--selected" : ""} `}>
                <div className='script-block__accordion'>
                    <div className='script-block__title'>{this.title}</div>
                </div>
                <div className='script-block__panel'>
                    {selected ? this.content() : null}
                </div>
            </div>
        );
    }

}
