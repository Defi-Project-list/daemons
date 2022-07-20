import React from "react";
import "./card.css";
import "./card-icons.css";

interface ICardProps {
    title: string;
    iconClass: string;
    children: any;
    actionComponent?: JSX.Element;
}

export function Card(props: ICardProps): JSX.Element {
    return (
        <div className="card">
            <div className="card__header">
                <div className={`card__title-icon ${props.iconClass}`}></div>
                <div className="card__title">{props.title}</div>
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
