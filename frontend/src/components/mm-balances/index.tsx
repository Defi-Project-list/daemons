import { bigNumberToFloat, InfoFetcherABI } from "@daemons-fi/contracts/build";
import { BigNumber, Contract, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { IToken, MoneyMarket } from "../../data/chains-data/interfaces";
import { RootState } from "../../state";
import { successToast } from "../toaster";
import "./styles.css";

const getInfoFetcherContract = async (chainId: string): Promise<Contract> => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const InfoFetcherAddress = GetCurrentChain(chainId).contracts.InfoFetcher;

    return new ethers.Contract(InfoFetcherAddress, InfoFetcherABI, provider);
};

interface IMmBalancesProps {
    moneyMarket: MoneyMarket;
}

interface IMmTokenInfo {
    token: IToken;
    balance: number;
    APY: number;
}

export const MmBalances = ({ moneyMarket }: IMmBalancesProps): JSX.Element => {
    const chainId = useSelector((state: RootState) => state.user.chainId)!;
    const address = useSelector((state: RootState) => state.user.address)!;
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [healthFactor, setHealthFactor] = useState<string | undefined>();
    const [depositedTokensInfo, setDepositedTokensInfo] = useState<IMmTokenInfo[]>([]);
    const [varLoansInfo, setVarLoansInfo] = useState<IMmTokenInfo[]>([]);
    const [fixLoansInfo, setFixLoansInfo] = useState<IMmTokenInfo[]>([]);

    const triggerReload = async () => {};

    const fetchData = async () => {
        const InfoFetcher = await getInfoFetcherContract(chainId);
        const tokensDict: { [tokenAddress: string]: IToken } = {};
        GetCurrentChain(chainId).tokens.forEach((t) => (tokensDict[t.address] = t));

        // extract mmTokens into an array
        const aTks = Object.values(moneyMarket.mmTokens).map((m) => m.aToken);
        const varDebtTks = Object.values(moneyMarket.mmTokens).map((m) => m.varDebtToken);
        const fixDebtTks = Object.values(moneyMarket.mmTokens).map((m) => m.fixDebtToken);
        let mmTokens = [...aTks, ...varDebtTks, ...fixDebtTks].filter(
            (a) => a !== "0x0000000000000000000000000000000000000000"
        );

        // map mmTokens to the main token
        let mmTokenToToken: { [mmToken: string]: IToken } = {};
        Object.keys(moneyMarket.mmTokens).forEach((address) => {
            Object.values(moneyMarket.mmTokens[address]).forEach((mmTokenAddress) => {
                mmTokenToToken[mmTokenAddress] = tokensDict[address];
            });
        });

        // extract MM information using the InfoFetcher contract
        const result: any = await InfoFetcher.fetchMmInfo(
            moneyMarket.poolAddress,
            moneyMarket.isV3,
            address,
            [],
            []
        );

        // set health factor

        setHealthFactor(
            result.accountData.healthFactor.lt(100000)
                ? result.accountData.healthFactor.toString()
                : "∞"
        );

        // build a dictionary containing the APYs (in RAY)
        const APYs: BigNumber[] = result.APYs;
        const rayForToken: { [tokenAddress: string]: BigNumber } = {};
        moneyMarket.supportedTokens.forEach((t, i) => {
            // for each supported token, we have 3 APYs, in order (deposit, varLoan, fixLoan)
            const aToken = moneyMarket.mmTokens[t.address].aToken;
            const varToken = moneyMarket.mmTokens[t.address].varDebtToken;
            const fixToken = moneyMarket.mmTokens[t.address].fixDebtToken;
            rayForToken[aToken] = APYs[i * 3];
            rayForToken[varToken] = APYs[i * 3 + 1];
            rayForToken[fixToken] = APYs[i * 3 + 2];
        });

        // build balances dictionary
        const balances: BigNumber[] = result.balances;
        const balanceForMmToken: { [tokenAddress: string]: BigNumber } = {};
        mmTokens.forEach((t, i) => (balanceForMmToken[t] = balances[i]));

        const getTokenInfoFromMmToken = (mmToken: string) =>
            ({
                token: mmTokenToToken[mmToken],
                APY: calculateAPY(rayForToken[mmToken]),
                balance: bigNumberToFloat(balanceForMmToken[mmToken])
            } as IMmTokenInfo);

        // set tokens information
        const depositsInfo = aTks
            .filter((t) => t !== "0x0000000000000000000000000000000000000000")
            .filter((t) => balanceForMmToken[t].gt(0))
            .map(getTokenInfoFromMmToken);
        setDepositedTokensInfo(depositsInfo);

        const variableDebts = varDebtTks
            .filter((t) => t !== "0x0000000000000000000000000000000000000000")
            .filter((t) => balanceForMmToken[t].gt(0))
            .map(getTokenInfoFromMmToken);
        setVarLoansInfo(variableDebts);

        const fixedDebts = fixDebtTks
            .filter((t) => t !== "0x0000000000000000000000000000000000000000")
            .filter((t) => balanceForMmToken[t].gt(0))
            .map(getTokenInfoFromMmToken);
        setFixLoansInfo(fixedDebts);

        setIsLoading(false);
    };

    const fetchDataWithLoading = async () => {
        setIsLoading(true);
        await fetchData();
    };

    useEffect(() => {
        fetchDataWithLoading();
    }, []);

    return (
        <div className="mm-balances">
            {/* Header */}
            <div className="mm-balances__header">
                <div className="mm-balances__title">{moneyMarket.name} Status</div>
                <div
                    onClick={async () => {
                        await fetchDataWithLoading();
                        successToast("MM info updated");
                    }}
                    className={`wallet-state__reload-bt ${
                        isLoading ? "wallet-state__reload-bt--loading" : ""
                    }`}
                />
            </div>
            <div className="mm-balances__health-factor">
                Health Factor: {healthFactor ?? "?"}
            </div>

            {/* Deposits */}
            <div className="mm-balances__subsection">Deposits</div>
            <div className="mm-balances__tokens-list">
                {depositedTokensInfo.length > 0 ? (
                    depositedTokensInfo.map((t) => (
                        <TokenWithBalanceAndApy
                            key={t.token.address}
                            token={t.token}
                            balance={t.balance}
                            apy={t.APY}
                        />
                    ))
                ) : (
                    <div className="mm-balances__empty">No deposits...</div>
                )}
            </div>

            {/* Variable Loans */}
            <div className="mm-balances__subsection">Variable Rate Loans</div>
            <div className="mm-balances__tokens-list">
                {varLoansInfo.length > 0 ? (
                    varLoansInfo.map((t) => (
                        <TokenWithBalanceAndApy
                            key={t.token.address}
                            token={t.token}
                            balance={t.balance}
                            apy={t.APY}
                        />
                    ))
                ) : (
                    <div className="mm-balances__empty">No variable rate loans...</div>
                )}
            </div>

            {/* Fixed Loans */}
            <div className="mm-balances__subsection">Stable Rate Loans</div>
            <div className="mm-balances__tokens-list">
                {fixLoansInfo.length > 0 ? (
                    fixLoansInfo.map((t) => (
                        <TokenWithBalanceAndApy
                            key={t.token.address}
                            token={t.token}
                            balance={t.balance}
                            apy={t.APY}
                        />
                    ))
                ) : (
                    <div className="mm-balances__empty">No fixed rate loans...</div>
                )}
            </div>
        </div>
    );
};

const TokenWithBalanceAndApy = ({
    token,
    balance,
    apy
}: {
    token: IToken;
    balance: number;
    apy: number;
}): JSX.Element => (
    <div className="token-with-balance">
        <img className="token-with-balance__img" src={token.logoURI} />
        {/* <div className="token-with-balance__name">{token.symbol}</div> */}
        <div className="token-with-balance__balance">{balance}</div>
        <div className="token-with-balance__apy">{apy}%</div>
    </div>
);

const RAY = BigNumber.from(10).pow(27);
const SECONDS_PER_YEAR = 31536000;
const calculateAPY = (rayValue: BigNumber): number => {
    const APR = rayValue.mul(10000).div(RAY).toNumber() / 10000;
    const APY = Math.pow(1 + APR / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1;
    return Math.round(APY * 10000) / 100;
};
