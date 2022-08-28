import React from "react";
import "./styles.css";

interface ISwitchProps {
    value: boolean;
    setValue: (value: boolean) => void;
}

export const Switch = ({ value, setValue }: ISwitchProps) => (
    <label className="switch">
        <input type="checkbox" checked={value} onChange={() => setValue(!value)} />
        <span className="slider round"></span>
    </label>
);
