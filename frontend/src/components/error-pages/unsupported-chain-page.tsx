import React, { Component, ReactNode } from 'react';
import './styles.css';

export class UnsupportedChainPage extends Component {

    public render(): ReactNode {
        return (
            <div className="disconnected">
                Our daemons do not support this chain yet.
            </div>
        );
    }
}
