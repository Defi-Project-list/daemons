import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { GetCurrentChain } from "../../data/chain-info";
import { RootState, useAppDispatch, useAppSelector } from "../../state";
import { UniswapV2PairABI } from "@daemons-fi/contracts";
import { bigNumberToFloat } from "@daemons-fi/contracts";
import { Cacher } from "../../data/cacher";
import CountUp from "react-countup";
import { fetchTreasuryStats } from "../../state/action-creators/treasury-action-creators";

type reserves = { resETH: number; resDAEM: number };

export function TreasuryData(): JSX.Element {
    const dispatch = useAppDispatch();
    const chainId = useAppSelector((state: RootState) => state.user.chainId)!;
    const [lpTreasuryBalance, setLpTreasuryBalance] = useState<number | undefined>();
    const [lpOwnedPercentage, setLpOwnedPercentage] = useState<number | undefined>();
    const [lpReserves, setLpReserves] = useState<reserves | undefined>();
    const [apr, setApr] = useState<number | undefined>();
    const [apy, setApy] = useState<number | undefined>();
    const currencySymbol = GetCurrentChain(chainId).coinSymbol;
    const currentDAEMPrice = useAppSelector((state: RootState) => state.prices.DAEMPriceInEth);
    const distrInterval = useAppSelector((state: RootState) => state.treasury.distrInterval);
    const redistributionPool = useAppSelector((state: RootState) => state.treasury.redistributionPool);
    const stakedAmount = useAppSelector((state: RootState) => state.treasury.stakedAmount);

    const secondsInOneYear = 31104000;
    const calculateAPR = (): number =>
        // 360 / distribution-in-days * treasury / staked-DAEM / ETH-worth-of-DAEM
        (((secondsInOneYear / distrInterval!) * redistributionPool!) /
            stakedAmount! /
            currentDAEMPrice!) *
        100;

    // LP Balance
    const fetchAndSetLpBalance = async (): Promise<void> => {
        const f = async () => {
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);

            const lpAddress = GetCurrentChain(chainId).contracts.wethDaemLp;
            const treasuryAddress = GetCurrentChain(chainId).contracts.Treasury;

            // get treasury owned amount
            const lpPair = new ethers.Contract(lpAddress, UniswapV2PairABI, provider);
            const lpTreasuryBalanceRaw = await lpPair.balanceOf(treasuryAddress);
            const lpBalance = bigNumberToFloat(lpTreasuryBalanceRaw);

            // get total LP amount
            const totalSupplyRaw = await lpPair.totalSupply();
            const totalSupply = bigNumberToFloat(totalSupplyRaw);

            // get owned percentage
            const ownedPercentage = lpBalance / totalSupply;

            // get reserves
            const lpReservesRaw = await lpPair.getReserves();
            const daemReserve = bigNumberToFloat(lpReservesRaw[0]);
            const ethReserve = bigNumberToFloat(lpReservesRaw[1]);

            return { lpBalance, ownedPercentage, ethReserve, daemReserve };
        };
        const lpStats = await Cacher.fetchData(`B/lpBalance/${chainId}`, f);
        setLpTreasuryBalance(lpStats.lpBalance);
        setLpOwnedPercentage(lpStats.ownedPercentage);
        setLpReserves({ resETH: lpStats.ethReserve, resDAEM: lpStats.daemReserve });
    };

    useEffect(() => {
        dispatch(fetchTreasuryStats(chainId));
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
            <br />
            <div className="treasury-stats__group">
                <div className="treasury-stats__title">Treasury owned LP</div>
                <div className="treasury-stats__value">
                    <CountUp duration={0.5} decimals={4} end={lpTreasuryBalance ?? 0} />
                    <CountUp
                        duration={0.5}
                        decimals={2}
                        prefix={` (`}
                        suffix={`% of total)`}
                        end={(lpOwnedPercentage ?? 0) * 100}
                    />
                </div>
            </div>
            <div className="treasury-stats__group">
                <div className="treasury-stats__title">Owned LP composition</div>
                <div className="treasury-stats__value">
                    <CountUp
                        duration={0.5}
                        decimals={4}
                        suffix={` ${currencySymbol} + `}
                        end={(lpOwnedPercentage ?? 0) * (lpReserves?.resETH ?? 0)}
                    />
                    <CountUp
                        duration={0.5}
                        decimals={2}
                        suffix={`DAEM`}
                        end={(lpOwnedPercentage ?? 0) * (lpReserves?.resDAEM ?? 0)}
                    />
                </div>
            </div>
        </div>
    );
}
