import React from "react";
import { HeadlessCard } from "../../components/card/card";

export function Explanation() {
    return (
        <HeadlessCard>
            <div>
                This page can be used to automatically execute Daemons scripts, in exchange for DAEM
                tokens.
            </div>
            <br />
            <div>
                <strong>No information inputted here is saved anywhere</strong>, yet it is advisable
                to <strong>not use your main wallet key</strong>.
            </div>
        </HeadlessCard>
    );
}
