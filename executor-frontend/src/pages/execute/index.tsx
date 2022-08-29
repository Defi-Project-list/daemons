import React, { useState } from "react";
import { ExecutionSetup, IExecutionSetupForm } from "./execution-setup";
import { ExecutionState } from "./execution-state";
import { TooltipSize } from "../../components/tooltip";
import { Card } from "../../components/card/card";
import "./styles.css";

export function ExecutePage() {
    const [setupData, setSetupData] = useState<IExecutionSetupForm | undefined>();

    const setupTooltip = (
        <div>
            Here you can input the info needed to the automatic execution.
            <br />
            <br />
            Once you are done, press `START`, sit back and see your profits.
        </div>
    );

    return (
        <div className="execute-page">
            <div className="page-title">Execute</div>

            <div className="execute-page__layout">
                <div className="execute-page__left-panel">
                    <Card
                        title="Setup Automatic Execution"
                        iconClass="card__title-icon--script"
                        tooltipContent={setupTooltip}
                        tooltipSize={TooltipSize.Large}
                    >
                        <ExecutionSetup submitSetupData={setSetupData} />
                    </Card>
                </div>
                <div className="execute-page__right-panel">
                    <Card title="Execution State" iconClass="card__title-icon--profits">
                        <ExecutionState setupData={setupData} />
                    </Card>
                </div>
            </div>
        </div>
    );
}
