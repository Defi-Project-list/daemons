import React, { useEffect, useState } from "react";
import { RootState } from "../../state";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { Workbench } from "./workbench/workbench";
import { TokenBalances } from "../../components/token-balances";
import { HeadlessCard } from "../../components/card/card";
import "./styles.css";
import { MmBalances } from "../../components/mm-balances";
import { GetCurrentChain } from "../../data/chain-info";

export function ScriptDesignerPage(): JSX.Element {
    // redux
    const navigate = useNavigate();
    const chainId: string | undefined = useSelector((state: RootState) => state.user.chainId)!;
    const user: IUserProfile | undefined = useSelector(
        (state: RootState) => state.user.userProfile
    );
    const supportedChain: boolean = useSelector((state: RootState) => state.user.supportedChain);
    const currentChain = GetCurrentChain(chainId!);
    const [isWalletRetracted, setWalletRetracted] = useState<boolean>(
        window.localStorage["wallet-retracted"] === "true"
    );

    const toggleRetractedState = () => {
        window.localStorage["wallet-retracted"] = !isWalletRetracted;
        setWalletRetracted(!isWalletRetracted);
    };

    useEffect(() => {
        if (!user || !chainId || user.banned || !supportedChain) navigate("/my-page");
    }, [user, chainId, supportedChain]);

    return (
        <div className="designer">
            <Workbench chainId={chainId} />

            {/* Wallet state */}
            <div
                className={`retractable-card ${
                    isWalletRetracted ? "retractable-card--retracted" : ""
                }`}
            >
                <div onClick={toggleRetractedState} className="retractable-card__button">
                    <div
                        className={`retractable-card__button-icon ${
                            isWalletRetracted ? "retractable-card__button-icon--retracted" : ""
                        }`}
                    />
                </div>
                <HeadlessCard>
                    <div className="wallet-state">
                        <div className="wallet-state__title">Wallet State</div>
                        <TokenBalances />
                        {currentChain.moneyMarkets.map((mm) => (
                            <MmBalances key={mm.poolAddress} moneyMarket={mm} />
                        ))}
                    </div>
                </HeadlessCard>
            </div>
        </div>
    );
}
