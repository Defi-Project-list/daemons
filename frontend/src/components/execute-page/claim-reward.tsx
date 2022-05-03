import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { RootState } from "../../state";
import { fetchGasTankClaimable } from "../../state/action-creators/gas-tank-action-creators";
import {
    fetchStakingBalance,
    fetchStakingClaimable
} from "../../state/action-creators/staking-action-creators";
import { fetchDaemBalance } from "../../state/action-creators/wallet-action-creators";
import { getAbiFor } from "../../utils/get-abi";
import Confetti from "react-dom-confetti";
import "./claim-reward.css";

const confettiConfig: any = {
    angle: "127",
    spread: "360",
    startVelocity: "25",
    elementCount: "33",
    dragFriction: "0.13",
    duration: "1310",
    stagger: "7",
    width: "10px",
    height: "10px",
    perspective: "360px",
    colors: ["#000", "#f00"]
  };

export function ClaimRewards() {
    const dispatch = useDispatch();
    const claimable = useSelector((state: RootState) => state.gasTank.claimable);
    const walletAddress = useSelector((state: RootState) => state.wallet.address);
    const chainId = useSelector((state: RootState) => state.wallet.chainId);
    const nothingToClaim = !claimable;
    const [confetti, setConfetti] = useState<boolean>(false);
    const [firstTime, setFirstTime] = useState<boolean>(true);

    const claim = async () => {
        if (nothingToClaim) return;
        const gasTank = await getGasTankContract();
        const tx = await gasTank.claimReward();
        await tx.wait();

        dispatch(fetchGasTankClaimable(walletAddress, chainId));
        dispatch(fetchDaemBalance(walletAddress, chainId));
    };

    useEffect(() => {
        if (!firstTime && claimable && claimable > 0)
        {
            setConfetti(true);
            setTimeout(() => setConfetti(false), 3000);
        }
        if (claimable && claimable > 0) setFirstTime(false);
    }, [claimable]);

    const claimAndStake = async () => {
        if (nothingToClaim) return;
        const gasTank = await getGasTankContract();
        const tx = await gasTank.claimAndStakeReward();
        await tx.wait();

        dispatch(fetchGasTankClaimable(walletAddress, chainId));
        dispatch(fetchStakingClaimable(walletAddress, chainId));
        dispatch(fetchStakingBalance(walletAddress, chainId));
        dispatch(fetchDaemBalance(walletAddress, chainId));
    };

    const getGasTankContract = async () => {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        if (!IsChainSupported(chainId!)) throw new Error(`Chain ${chainId} is not supported!`);
        const contractAddress = GetCurrentChain(chainId!).contracts.GasTank;

        const contractAbi = await getAbiFor("GasTank");
        const gasTank = new ethers.Contract(contractAddress, contractAbi, signer);
        return gasTank;
    };

    return (
        <div className="card">
            <div className="card__title">Claim DAEM</div>
            <div className="claim-reward">
                <div className="claim-reward__claimable">
                    {nothingToClaim ? `Nothing to claim` : `${claimable} DAEM to be claimed`}
                    <Confetti active={confetti} config={confettiConfig} />
                </div>
                <div className="claim-reward__buttons-container">
                    <button
                        disabled={nothingToClaim}
                        className="claim-reward__button"
                        onClick={() => {
                            claim();
                        }}
                    >
                        Claim
                    </button>
                    <button
                        disabled={nothingToClaim}
                        className="claim-reward__button"
                        onClick={() => {
                            claimAndStake();
                        }}
                    >
                        Claim &#38; Stake
                    </button>
                </div>
            </div>
        </div>
    );
}
