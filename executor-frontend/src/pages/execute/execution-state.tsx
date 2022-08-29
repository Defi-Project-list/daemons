import React from "react";
import { IExecutionSetupForm } from "./execution-setup";

interface IExecutionStateProps {
    setupData?: IExecutionSetupForm;
}

export function ExecutionState({ setupData }: IExecutionStateProps) {
    if (!setupData) return <div>Please setup the execution...</div>

    return <div></div>;
}
