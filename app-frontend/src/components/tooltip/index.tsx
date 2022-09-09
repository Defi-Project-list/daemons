import React from "react";
import "./styles.css";

export enum TooltipSize {
    Small = 1,
    Medium = 2,
    Large = 3
}

export enum TooltipIcon {
    Info = 1,
    Alert = 2,
    Success = 3
}

interface ITooltipProps {
    children: any;
    size?: TooltipSize;
    icon?: TooltipIcon;
    iconComponent?: JSX.Element;
}

export const Tooltip = ({ children, size, icon, iconComponent }: ITooltipProps): JSX.Element => (
    <div className="tooltip">
        {iconComponent || <div className={"tooltip__icon " + iconToClass(icon)} />}
        <div className={"tooltip__content " + sizeToClass(size)}>{children}</div>
    </div>
);

const sizeToClass = (size?: TooltipSize) =>
    size === undefined || size === TooltipSize.Small
        ? ""
        : size === TooltipSize.Medium
        ? "tooltip__content--medium "
        : "tooltip__content--large ";

const iconToClass = (icon?: TooltipIcon) =>
    icon === undefined || icon === TooltipIcon.Info
        ? ""
        : icon === TooltipIcon.Alert
        ? "tooltip__icon--alert "
        : "tooltip__icon--success ";
