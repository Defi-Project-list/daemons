import React, { Component, ReactNode } from "react";
import "./styles.css";

export class NotWhitelistedPage extends Component {
    public render(): ReactNode {
        return (
            <div className="not-whitelisted">
                It seems you are not in the whitelist :(.
                <br />
                <br />
                Daemons is in beta phase and only 100 users are allowed for now.
                <br />
                Check out our social for news about the platform and reach out to us for any
                questions.
            </div>
        );
    }
}
