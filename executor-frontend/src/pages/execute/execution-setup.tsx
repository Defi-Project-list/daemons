import React from "react";
import { Card } from "../../components/card/card";
import { TooltipSize } from "../../components/tooltip";
import "./styles.css";

export function ExecutionSetup() {
    const tooltipContent = (
        <div>
            Here you can input the info needed to the automatic execution.
            <br/><br/>
            Once you are done, press `START`, sit back and see your profits.
        </div>
    );

    return (
        <Card
            title="Setup Automatic Execution"
            iconClass="card__title-icon--script"
            tooltipContent={tooltipContent}
            tooltipSize={TooltipSize.Large}
        >
            <div className="queue-container"></div>
        </Card>
    );
}
