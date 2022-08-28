import React from "react";
import { Card } from "../../components/card/card";
import "./styles.css";

export function ExecutionState() {

    return (
        <Card
            title="Execution State"
            iconClass="card__title-icon--script"
        >
            <div className="card__subtitle">Execute scripts and get rewarded in DAEM tokens</div>
            <div className="queue-container"></div>
        </Card>
    );
}
