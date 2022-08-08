import React from "react";
import "./styles.css";

interface ITooltipProps {
    children: any;
}

export const Tooltip = ({children} : ITooltipProps): JSX.Element => (
    <div className="tooltip">
        <div className="tooltip__text">?</div>
        <div className="tooltip__content">{children}</div>
    </div>
);
