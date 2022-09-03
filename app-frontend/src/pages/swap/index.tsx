import React, { useEffect, useState } from "react";
import { RootState, useAppDispatch, useAppSelector } from "../../state";
import { Card } from "../../components/card/card";
import { IUserProfile } from "../../data/storage-proxy/auth-proxy";
import { BannedPage } from "../error-pages/banned-page";
import { NotWhitelistedPage } from "../error-pages/not-whitelisted-page";
import { DisconnectedPage } from "../error-pages/disconnected-page";
import { UnsupportedChainPage } from "../error-pages/unsupported-chain-page";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { ethers } from "ethers";
import { bigNumberToFloat, ERC20Abi, liquidityManagerABI } from "@daemons-fi/contracts/build";
import "./styles.css";
import { TokensModal } from "../../components/tokens-modal";
import { IToken } from "../../data/chains-data/interfaces";
import { promiseToast } from "../../components/toaster";
import { AllowanceHelper } from "@daemons-fi/scripts-definitions/build";
import { fetchTokenBalances } from "../../state/action-creators/wallet-action-creators";

const getLiquidityManagerContract = (chainId: string) => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const lmAddress = GetCurrentChain(chainId).contracts.ILiquidityManager;
    return new ethers.Contract(lmAddress, liquidityManagerABI, signer);
};

const getTokenContract = (token: IToken) => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(token.address, ERC20Abi, signer);
};

let delayTimer: NodeJS.Timeout | undefined;

export function SwapPage() {
    const dispatch = useAppDispatch();
    const user: IUserProfile | undefined = useAppSelector(
        (state: RootState) => state.user.userProfile
    );
    const chainId: string | undefined = useAppSelector((state: RootState) => state.user.chainId);
    const supportedChain: boolean = useAppSelector((state: RootState) => state.user.supportedChain);
    const tokens = GetCurrentChain(chainId!).swapTokens;
    const daemAddress = GetCurrentChain(chainId!).contracts.DaemonsToken;
    const daemToken = tokens.find((t) => t.address === daemAddress)!;
    const [tokenA, setTokenA] = useState<IToken>(tokens[0]);
    const [tokenB, setTokenB] = useState<IToken>(daemToken);
    const [amountA, setAmountA] = useState<number>(0);
    const [amountB, setAmountB] = useState<number>(0);
    const ethBalance = useAppSelector((state: RootState) => state.wallet.ETHBalance);
    const tokenBalances = useAppSelector((state: RootState) => state.wallet.tokenBalances);
    const [requiresAllowance, setRequiresAllowance] = useState<IToken | undefined>();

    useEffect(() => {
        if (!chainId || !user || !tokens) return;
        setTokenA(tokens[0]);
        setTokenB(daemToken);
    }, [chainId, user, tokens]);

    const getTokens = (token: IToken, thisToken: IToken, otherToken: IToken) => {
        // same selection, no changes
        if (token.address === thisToken.address) return [thisToken, otherToken];

        // inverted selection
        if (token.address === otherToken.address) return [otherToken, thisToken];

        // DAEM is the first token and we are removing it
        if (thisToken.address === daemAddress) return [token, daemToken];

        // DAEM is the second token and we are not removing it
        return [token, otherToken];
    };

    const calculateAndSetAmountB = async () => {
        const inputBN = ethers.utils.parseEther(amountA.toString());
        const lm = getLiquidityManagerContract(chainId!);
        const quote =
            tokenA.address === daemAddress
                ? await lm.DAEMToETH(inputBN)
                : await lm.ETHToDAEM(inputBN);

        setAmountB(bigNumberToFloat(quote, 5));
    };

    useEffect(() => {
        clearTimeout(delayTimer);
        if (amountA === 0) {
            setAmountB(0);
            return;
        }
        delayTimer = setTimeout(() => calculateAndSetAmountB(), 500);
    }, [amountA]);

    useEffect(() => {
        checkForAllowance();
    }, [tokenA]);

    const checkForAllowance = async () => {
        if (tokenA.address.includes("0xeeeeeee")) {
            // ETH never requires allowance
            setRequiresAllowance(undefined);
            return;
        }

        const lmAddress = GetCurrentChain(chainId!).contracts.ILiquidityManager;
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();
        const hasAllowance = await AllowanceHelper.checkForERC20Allowance(
            user!.address,
            tokenA.address,
            lmAddress,
            ethers.utils.parseEther("100000"),
            signer
        );

        setRequiresAllowance(!hasAllowance ? tokenA : undefined);
    };

    const swap = async () => {
        const lm = getLiquidityManagerContract(chainId!);
        const amountIn = ethers.utils.parseEther(amountA.toString());
        const quoteMinusSlippage = ethers.utils.parseEther((amountB * 0.99).toString());
        let tx;
        if (tokenA.address.includes("0xeeeeeeee")) {
            // Swapping ETH -> DAEM
            tx = await lm.swapETHforDAEM(quoteMinusSlippage, user!.address, 0xffffffffff, {
                value: amountIn
            });
        } else {
            const swapType =
                tokenA.address !== daemAddress ? 0 : tokenB.address.includes("0xeeeeeeeee") ? 2 : 1;
            tx = await lm.swapTokenForToken(
                amountIn,
                swapType,
                quoteMinusSlippage,
                user!.address,
                0xffffffffff
            );
        }
        await promiseToast(
            tx.wait,
            `Swapping ${amountA} ${tokenA.symbol} for ${amountB} ${tokenB.symbol}`,
            "Swap successful 🎉",
            "Something bad happened. Contact us if the error persists"
        );

        setAmountA(0);
        dispatch(fetchTokenBalances(user!.address, chainId));
    };

    const requestAllowance = async () => {
        if (!requiresAllowance) return;

        const lmAddress = GetCurrentChain(chainId!).contracts.ILiquidityManager;
        const token = getTokenContract(requiresAllowance);
        const tx = await token.approve(lmAddress, ethers.utils.parseEther("999999999"));

        await promiseToast(
            tx.wait,
            `Granting the allowance to swap ${tokenA.symbol} (this is a one-time action)...`,
            "Allowance granted 💪",
            "Something bad happened. Contact us if the error persists"
        );

        checkForAllowance();
    };

    const getBalance = (token: IToken) => {
        return token.address.includes("0xeeeeeeee") ? ethBalance : tokenBalances[token.address];
    };

    if (user && !user.whitelisted) return <NotWhitelistedPage />;
    if (user && user.banned) return <BannedPage />;
    if (!chainId) return <DisconnectedPage />;
    if (!supportedChain) return <UnsupportedChainPage />;

    return (
        <div className="swap-page">
            <div className="page-title">Swap</div>

            <div className="swap-page__layout">
                <Card title="Swap" iconClass="card__title-icon--transactions">
                    {/* Token From */}
                    <div className="swap__token">
                        <TokensModal
                            tokens={tokens}
                            selectedToken={tokenA}
                            setSelectedToken={(token) => {
                                const [tA, tB] = getTokens(token, tokenA, tokenB);
                                setTokenA(tA);
                                setTokenB(tB);
                                setAmountA(0);
                            }}
                        />
                        <div className="swap__amount">
                            <input
                                type="number"
                                id="id-input-from"
                                className="card__input"
                                value={amountA}
                                onChange={(e) => setAmountA(Math.abs(Number(e.target.value)))}
                            />
                            {tokenA && (
                                <div
                                    className="swap__max-input"
                                    onClick={() => setAmountA(getBalance(tokenA))}
                                >
                                    Max: {getBalance(tokenA)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div
                        className="swap__divider"
                        onClick={() => {
                            setTokenA(tokenB);
                            setTokenB(tokenA);
                            setAmountA(0);
                        }}
                    />

                    {/* Token To */}
                    <div className="swap__token">
                        <TokensModal
                            tokens={tokens}
                            selectedToken={tokenB}
                            setSelectedToken={(token) => {
                                const [tB, tA] = getTokens(token, tokenB, tokenA);
                                setTokenA(tA);
                                setTokenB(tB);
                                setAmountA(0);
                            }}
                        />
                        <div className="swap__amount">
                            <input
                                id="id-input-to"
                                readOnly={true}
                                className="card__input"
                                value={amountB}
                            />
                        </div>
                    </div>

                    {/* buttons */}
                    {requiresAllowance !== undefined ? (
                        <button
                            className="swap__button"
                            onClick={requestAllowance}
                        >
                            Grant {requiresAllowance.symbol} allowance
                        </button>
                    ) : (
                        <button
                            className="swap__button"
                            disabled={!amountA || !amountB}
                            onClick={swap}
                        >
                            Swap
                        </button>
                    )}
                </Card>
            </div>
        </div>
    );
}
