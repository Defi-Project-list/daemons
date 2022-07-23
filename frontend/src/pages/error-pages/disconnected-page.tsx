import React, { Component, ReactNode } from "react";
import "./styles.css";

export class DisconnectedPage extends Component {
    public render(): ReactNode {
        return (
            <>
                <div className="disconnected">
                    Connect via Metamask and prove you own that address to access Daemons.
                </div>
            </>
        );
    }
}
