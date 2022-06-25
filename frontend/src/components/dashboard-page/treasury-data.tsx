import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { RootState } from "../../state";
import { ERC20Abi, treasuryABI } from "@daemons-fi/abis";
import { bigNumberToFloat } from "../../utils/big-number-to-float";
import { Cacher } from "../../data/cacher";
import CountUp from "react-countup";

const getTreasuryContract = (chainId: string) => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const treasuryAddress = GetCurrentChain(chainId).contracts.Treasury;
    return new ethers.Contract(treasuryAddress, treasuryABI, provider);
};

export function TreasuryData(): JSX.Element {
    const chainId = useSelector((state: RootState) => state.wallet.chainId)!;
    const [redistributionPool, setRedistributionPool] = useState<number | undefined>();
    const [stakedAmount, setStakedAmount] = useState<number | undefined>();
    const [distrInterval, setDistrInterval] = useState<number | undefined>();
    const [lpTreasuryBalance, setLpTreasuryBalance] = useState<number | undefined>();
    const [apr, setApr] = useState<number | undefined>();
    const [apy, setApy] = useState<number | undefined>();
    const currencySymbol = GetCurrentChain(chainId).coinSymbol;
    const currentDAEMPrice = useSelector((state: RootState) => state.prices.DAEMPriceInEth);

    const secondsInOneYear = 31104000;
    const calculateAPR = (): number =>
        // 360 / distribution-in-days * treasury / staked-DAEM / ETH-worth-of-DAEM
        (((secondsInOneYear / distrInterval!) * redistributionPool!) /
            stakedAmount! /
            currentDAEMPrice!) *
        100;

    // Treasury Stats
    const fetchAndSetTreasuryStats = async (): Promise<void> => {
        const f = async () => {
            const treasury = getTreasuryContract(chainId);
            const redistributionAmount = bigNumberToFloat(await treasury.redistributionPool(), 6);
            const stakedAmount = bigNumberToFloat(await treasury.stakedAmount(), 6);
            const distrInterval = (await treasury.redistributionInterval()).toNumber();
            return { redistributionAmount, stakedAmount, distrInterval };
        };
        const treasuryStats = await Cacher.fetchData(`B/treasury-stats/${chainId}`, f);
        setRedistributionPool(treasuryStats.redistributionAmount);
        setStakedAmount(treasuryStats.stakedAmount);
        setDistrInterval(treasuryStats.distrInterval);
    };

    // LP Balance
    const fetchAndSetLpBalance = async (): Promise<void> => {
        const f = async () => {
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);

            const lpAddress = GetCurrentChain(chainId).contracts.wethDaemLp;
            const treasuryAddress = GetCurrentChain(chainId).contracts.Treasury;

            const lpToken = new ethers.Contract(lpAddress, ERC20Abi, provider);
            const lpTreasuryBalanceRaw = await lpToken.balanceOf(treasuryAddress);
            return bigNumberToFloat(lpTreasuryBalanceRaw);
        };
        const lpBalance = await Cacher.fetchData(`B/lpBalance/${chainId}`, f);
        setLpTreasuryBalance(lpBalance);
    };

    useEffect(() => {
        fetchAndSetTreasuryStats();
        fetchAndSetLpBalance();
    }, [chainId]);

    useEffect(() => {
        if (!redistributionPool || !currentDAEMPrice || !stakedAmount || !distrInterval) return;
        const apr = calculateAPR();
        const apy = (Math.pow(1 + apr / 100 / 365, 365) - 1) * 100;
        setApr(apr);
        setApy(apy);
    }, [redistributionPool, stakedAmount, distrInterval, currentDAEMPrice]);

    return (
        <div className="treasury-stats">
            <div className="treasury-stats__group">
                <div className="treasury-stats__title">{currencySymbol} APR</div>
                <div className="treasury-stats__value">
                    <CountUp duration={0.5} decimals={2} suffix={`%`} end={apr ?? 0} />
                </div>
            </div>
            <div className="treasury-stats__group">
                <div className="treasury-stats__title">{currencySymbol} APY</div>
                <div className="treasury-stats__value">
                    <CountUp duration={0.5} decimals={2} suffix={`%`} end={apy ?? 0} />
                </div>
            </div>
            <div className="treasury-stats__group">
                <div className="treasury-stats__title">To distribute</div>
                <div className="treasury-stats__value">
                    <CountUp
                        duration={0.5}
                        decimals={5}
                        suffix={` ${currencySymbol}`}
                        end={redistributionPool ?? 0}
                    />
                </div>
            </div>
            <div className="treasury-stats__group">
                <div className="treasury-stats__title">Staked</div>
                <div className="treasury-stats__value">
                    <CountUp duration={0.5} decimals={5} suffix={` DAEM`} end={stakedAmount ?? 0} />
                </div>
            </div>
            <div className="treasury-stats__group">
                <div className="treasury-stats__title">Treasury owned LP</div>
                <div className="treasury-stats__value">
                    <CountUp
                        duration={0.5}
                        decimals={4}
                        suffix={` DAEM-${currencySymbol}-LP`}
                        end={lpTreasuryBalance ?? 0}
                    />
                </div>
            </div>
        </div>
    );
}
