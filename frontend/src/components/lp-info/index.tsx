import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GetCurrentChain } from "../../data/chain-info";
import { IToken } from "../../data/chains-data/interfaces";
import { ILPInfo, retrieveLpInfo } from "../../data/retrieve-lp-info";
import { RootState } from "../../state";
import { Tooltip, TooltipIcon } from "../tooltip";
import "./styles.css";

interface ILpInfoBoxProps {
    tokenA: IToken;
    tokenB: IToken;
    dexRouter: string;
    showOwned?: boolean;
    setLpAddress?: (lpAddress: string) => void;
}

export const LpInfoBox = ({
    tokenA,
    tokenB,
    dexRouter,
    showOwned,
    setLpAddress
}: ILpInfoBoxProps): JSX.Element => {
    const chainId = useSelector((state: RootState) => state.user.chainId)!;
    const address = useSelector((state: RootState) => state.user.address)!;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [lpInfo, setLPInfo] = useState<ILPInfo | undefined>();

    const fetchLpInformation = async () => {
        setIsLoading(true);
        const lpInfo = await retrieveLpInfo(chainId, tokenA, tokenB, dexRouter, address);
        setLPInfo(lpInfo);
        setIsLoading(false);
        if (setLpAddress) setLpAddress(lpInfo.pairAddress);
    };

    useEffect(() => {
        fetchLpInformation();
    }, [tokenA, tokenB, dexRouter]);

    const liquidTooltip = () => (
        <Tooltip icon={TooltipIcon.Success}>
            This LP seems to be liquid. Low slippage expected.
        </Tooltip>
    );
    const notLiquidTooltip = () => (
        <Tooltip icon={TooltipIcon.Alert}>
            This LP doesn't seem very liquid. Beware of the high slippage!
        </Tooltip>
    );

    const lpName = () => (
        <div className="lp-info__lp-name">
            {" "}
            {tokenA?.symbol}-{tokenB?.symbol}-LP
        </div>
    );
    const linkToExplorer = () =>
        !lpInfo ? null : (
            <a
                className="lp-info__lp-address"
                href={`${GetCurrentChain(chainId).explorerUrl}token/${lpInfo.pairAddress}#code`}
            >
                {lpInfo.pairAddress}
            </a>
        );

    const loadingLPInfo = () => (
        <div className="lp-info">
            <div className="lp-info__header">
                {lpName()}
                <div />
                <div />
            </div>
            <div className="lp-info__loading">
                <div className="lp-info__loading-icon" />
            </div>
        </div>
    );

    const invalidLPInfo = () => (
        <div className="lp-info">
            <div className="lp-info__header">
                {lpName()}
                <div />
                <div />
            </div>
            <div className="lp-info__invalid">This DEX does not support this pair.</div>
        </div>
    );

    const validLpInfo = () => (
        <div className="lp-info">
            <div className="lp-info__header">
                {lpName()}
                {linkToExplorer()}
                {lpInfo?.isLiquid ? liquidTooltip() : notLiquidTooltip()}
            </div>
            <div className="lp-info__valid">
                <div className="lp-info__text">Contains</div>
                <div className="lp-info__reserves">
                    {lpInfo?.reserveA} {tokenA?.symbol} + {lpInfo?.reserveB} {tokenB?.symbol}
                </div>
                {showOwned && (
                    <div className="lp-info__owned">
                        <div className="lp-info__text">Owned</div>
                        {lpInfo?.userBalance}
                    </div>
                )}
            </div>
        </div>
    );

    return isLoading
        ? loadingLPInfo()
        : !lpInfo || !lpInfo.supported
        ? invalidLPInfo()
        : validLpInfo();
};
