import React, { useEffect } from "react";
import { RootState } from "../../state";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { Workbench } from "./workbench/workbench";
import { TokenBalances } from "../../components/token-balances";
import { HeadlessCard } from "../../components/card/card";
import "./styles.css";

export function ScriptDesignerPage(): JSX.Element {
    // redux
    const navigate = useNavigate();
    const chainId: string | undefined = useSelector((state: RootState) => state.user.chainId)!;
    const user: IUserProfile | undefined = useSelector(
        (state: RootState) => state.user.userProfile
    );
    const supportedChain: boolean = useSelector((state: RootState) => state.user.supportedChain);

    useEffect(() => {
        if (!user || !chainId || user.banned || !supportedChain) navigate("/my-page");
    }, [user, chainId, supportedChain]);

    return (
        <div className="designer">
            <Workbench chainId={chainId} />

            {/* Wallet state */}
            <HeadlessCard>
                <div className="wallet-state">
                    <div className="wallet-state__title">Wallet State</div>
                    <TokenBalances />
                </div>
            </HeadlessCard>
        </div>
    );
}
