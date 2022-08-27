import React from "react";
import "./card.css";
import "./card-icons.css";
import { Tooltip, TooltipSize } from "../tooltip";
import { RootState, useAppSelector } from "../../state";

interface ICardProps {
    title: string;
    iconClass: string;
    children: any;
    tooltipContent?: JSX.Element;
    tooltipSize?: TooltipSize;
    actionComponent?: JSX.Element;
}

export function Card(props: ICardProps): JSX.Element {
    const showTooltip = useAppSelector(
        (state: RootState) => state.user.userProfile?.showTutorial ?? true
    );

    return (
        <div className="card">
            <div className="card__header">
                <div className={`card__title-icon ${props.iconClass}`}></div>
                <div className="card__title">{props.title}</div>
                {showTooltip && props.tooltipContent && (
                    <Tooltip size={props.tooltipSize ?? TooltipSize.Medium}>
                        {props.tooltipContent}
                    </Tooltip>
                )}
                {props.actionComponent}
            </div>
            <div className="card__content">{props.children}</div>
        </div>
    );
}

export function HeadlessCard({ children }: { children: any }): JSX.Element {
    return (
        <div className="card">
            <div className="card__content">{children}</div>
        </div>
    );
}
