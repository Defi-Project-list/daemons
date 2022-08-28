import React from "react";
import { Explanation } from "./explanation";
import { ExecutionSetup } from "./execution-setup";
import { ExecutionState } from "./execution-state";
import "./styles.css";

export function ExecutePage() {
    return (
        <div className="execute-page">
            <div className="page-title">Execute</div>

            <div className="execute-page__layout">
                <div className="execute-page__left-panel">
                    <Explanation />
                    <ExecutionSetup />
                </div>
                <div className="execute-page__right-panel">
                    <ExecutionState />
                </div>
            </div>
        </div>
    );
}
