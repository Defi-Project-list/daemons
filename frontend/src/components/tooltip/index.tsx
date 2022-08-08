import React from "react";
import "./styles.css";

export enum TooltipSize {
    Small = 1,
    Medium = 2,
    Large = 3
}

interface ITooltipProps {
    children: any;
    size?: TooltipSize;
}

export const Tooltip = ({ children, size }: ITooltipProps): JSX.Element => (
    <div className="tooltip">
        <div className="tooltip__text">?</div>
        <div className={"tooltip__content " + sizeToClass(size)}>
            {children}
        </div>
    </div>
);

const sizeToClass = (size?: TooltipSize) =>
    size === undefined || size === TooltipSize.Small
        ? ""
        : size === TooltipSize.Medium
        ? "tooltip__content--medium "
        : "tooltip__content--large ";
