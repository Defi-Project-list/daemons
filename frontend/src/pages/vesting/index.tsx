import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import { Card } from "../../components/card/card";
import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { BannedPage } from "../error-pages/banned-page";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
import { DisconnectedPage } from "../error-pages/disconnected-page";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import CountUp from "react-countup";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { ethers } from "ethers";
import { bigNumberToFloat, vestingABI } from "@daemons-fi/contracts/build";
import "./styles.css";

const getVestingContract = (chainId: string) => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const vestingAddress = GetCurrentChain(chainId).contracts.Vesting;
    return new ethers.Contract(vestingAddress, vestingABI, signer);
};

export function VestingPage() {
    const user: IUserProfile | undefined = useSelector(
        (state: RootState) => state.user.userProfile
    );
    const chainId: string | undefined = useSelector((state: RootState) => state.user.chainId);
    const supportedChain: boolean = useSelector((state: RootState) => state.user.supportedChain);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [locked, setLocked] = useState<number>(0);
    const [available, setAvailable] = useState<number>(0);

    const fetchAvailable = async () => {
        const vesting = getVestingContract(chainId!);
        const DAEMAddress = GetCurrentChain(chainId!).contracts.DaemonsToken;
        const lockedRaw = await vesting.lockedAmount(DAEMAddress, user?.address);
        const availableRaw = await vesting.releasableAmount(DAEMAddress, user?.address);

        const startTimestamp = await vesting.start();
        const startDate = new Date(startTimestamp.toNumber() * 1000);
        setStartDate(startDate);
        setLocked(bigNumberToFloat(lockedRaw));
        setAvailable(bigNumberToFloat(availableRaw));
    };

    const claim = async () => {
        const vesting = getVestingContract(chainId!);
        const DAEMAddress = GetCurrentChain(chainId!).contracts.DaemonsToken;
        const tx = await vesting.release(DAEMAddress, user?.address);
        await tx.wait();
        await fetchAvailable();
    };

    useEffect(() => {
        if (!chainId || !user) return;
        fetchAvailable();
    }, [chainId, user]);

    if (user && !user.whitelisted) return <NotWhitelistedPage />;
    if (user && user.banned) return <BannedPage />;
    if (!chainId) return <DisconnectedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    const pleaseAuthenticate = () => (
        <div className="vesting">
            <div>Authenticate to check your vesting status</div>
        </div>
    );

    const calculating = () => (
        <div className="vesting">
            <div>Fetching the vesting data...</div>
        </div>
    );

    const vestingStats = () => (
        <div className="vesting-stats">
            <div className="vesting-stats__text">Your tokens</div>
            <div className="vesting-stats__value">
                <CountUp duration={0.5} decimals={2} suffix={" DAEM"} end={locked} />
            </div>
            <div className="vesting-stats__text">Available to claim</div>
            <div className="vesting-stats__value">
                <CountUp duration={0.5} decimals={2} suffix={" DAEM"} end={available} />
            </div>
        </div>
    );

    const vestingNotStarted = () => (
        <div className="vesting">
            {vestingStats()}

            <div className="vesting__text">The vesting hasn't started yet.</div>
            <div className="vesting__text">
                Come back to this page after {startDate?.toLocaleDateString()} to unlock the first
                tokens
            </div>
        </div>
    );

    const vestingStarted = () => (
        <div className="vesting">
            {vestingStats()}
            <div className="vesting__button" onClick={() => claim()}>
                Claim
            </div>
        </div>
    );

    return (
        <div className="vesting-page">
            <div className="page-title">Vesting</div>

            <div className="vesting-page__layout">
                <Card title="Vesting" iconClass="card__title-icon--bank">
                    {!user
                        ? pleaseAuthenticate()
                        : !startDate
                        ? calculating()
                        : startDate > new Date()
                        ? vestingNotStarted()
                        : vestingStarted()}
                </Card>
            </div>
        </div>
    );
}
