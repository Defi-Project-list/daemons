import { BigNumber, ContractInterface, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { RootState } from "../../state";
import { treasuryABI } from "@daemons-fi/abis";

interface ITreasuryStat {
    apr: number;
    apy: number;
    treasury: number;
    staked: number;
}

const cachedData: { [chain: string]: ITreasuryStat } = {};

export function TreasuryData(): JSX.Element {
    const chainId = useSelector((state: RootState) => state.wallet.chainId)!;
    const [data, setData] = useState<ITreasuryStat | undefined>();
    const currencySymbol = GetCurrentChain(chainId).coinSymbol;

    const secondsInOneYear = 31104000;
    const calculateAPY = (
        toBeDistributed: number,
        staked: number,
        ethWorthOfDaem: number,
        redistributionInterval: number
    ): number =>
        (((secondsInOneYear / redistributionInterval) * toBeDistributed) / staked) *
        ethWorthOfDaem *
        100;

    const fetchTreasuryStats = async (): Promise<ITreasuryStat> => {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);

        if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
        const contractAddress = GetCurrentChain(chainId).contracts.Treasury;
        const treasuryContract = new ethers.Contract(contractAddress, treasuryABI, provider);

        const convertToDecimal = (bn: BigNumber) =>
            bn.div(BigNumber.from(10).pow(13)).toNumber() / 100000;

        const treasury = convertToDecimal(await treasuryContract.redistributionPool());
        const staked = convertToDecimal(await treasuryContract.stakedAmount());
        const distrInterval = (await treasuryContract.redistributionInterval()).toNumber();
        const apr = calculateAPY(treasury, staked, 1, distrInterval);
        const apy = (Math.pow(1 + apr / 100 / 365, 365) - 1) * 100;

        return {
            apr,
            apy,
            staked,
            treasury
        };
    };

    const fetchData = async () => {
        if (!cachedData[chainId]) {
            cachedData[chainId] = await fetchTreasuryStats();
        }
        setData(cachedData[chainId]);
    };

    useEffect(() => {
        fetchData();
    }, [chainId]);

    return (
        <div className="treasury-stats">
            {data && (
                <>
                    <div className="treasury-stats__group">
                        <div className="treasury-stats__title">APR</div>
                        <div className="treasury-stats__value">{data.apr.toFixed(2)}%</div>
                    </div>
                    <div className="treasury-stats__group">
                        <div className="treasury-stats__title">APY</div>
                        <div className="treasury-stats__value">{data.apy.toFixed(2)}%</div>
                    </div>
                    <div className="treasury-stats__group">
                        <div className="treasury-stats__title">To be distributed</div>
                        <div className="treasury-stats__value">
                            {data.treasury} {currencySymbol}
                        </div>
                    </div>
                    <div className="treasury-stats__group">
                        <div className="treasury-stats__title">Currently staked</div>
                        <div className="treasury-stats__value">{data.staked} DAEM</div>
                    </div>
                </>
            )}
        </div>
    );
}
