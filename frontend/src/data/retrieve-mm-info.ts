import { bigNumberToFloat, InfoFetcherABI } from "@daemons-fi/contracts/build";
import { BigNumber, Contract, ethers } from "ethers";
import { GetCurrentChain, IsChainSupported } from "./chain-info";
import { IToken, MoneyMarket } from "./chains-data/interfaces";

export interface IMMInfo {
    healthFactor: string;
    deposits: { [aTokenAddress: string]: IMmTokenInfo };
    varDebts: { [varDebtTokenAddress: string]: IMmTokenInfo };
    fixDebts: { [fixDebtTokenAddress: string]: IMmTokenInfo };
}

interface IMmTokenInfo {
    token: IToken;
    balance: number;
    APY: number;
}

const getInfoFetcherContract = async (chainId: string): Promise<Contract> => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const InfoFetcherAddress = GetCurrentChain(chainId).contracts.InfoFetcher;

    return new ethers.Contract(InfoFetcherAddress, InfoFetcherABI, provider);
};

export const retrieveMmInfo = async (
    chainId: string,
    userAddress: string,
    moneyMarket: MoneyMarket
): Promise<IMMInfo> => {
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
        userAddress,
        moneyMarket.supportedTokens.map((t) => t.address),
        mmTokens
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
    const balances: BigNumber[] = result.balances.tokens;
    const balanceForMmToken: { [tokenAddress: string]: BigNumber } = {};
    mmTokens.forEach((t, i) => (balanceForMmToken[t] = balances[i]));

    const getTokenInfoFromMmToken = (mmToken: string) =>
        ({
            token: mmTokenToToken[mmToken],
            APY: calculateAPY(rayForToken[mmToken]),
            balance: bigNumberToFloat(balanceForMmToken[mmToken])
        } as IMmTokenInfo);

    // set tokens information
    const deposits: { [aTokenAddress: string]: IMmTokenInfo } = {};
    aTks.filter((t) => t !== "0x0000000000000000000000000000000000000000")
        .forEach((t) => (deposits[t] = getTokenInfoFromMmToken(t)));

    const varDebts: { [varDebtTokenAddress: string]: IMmTokenInfo } = {};
    varDebtTks
        .filter((t) => t !== "0x0000000000000000000000000000000000000000")
        .forEach((t) => (varDebts[t] = getTokenInfoFromMmToken(t)));

    const fixDebts: { [fixDebtTokenAddress: string]: IMmTokenInfo } = {};
    fixDebtTks
        .filter((t) => t !== "0x0000000000000000000000000000000000000000")
        .forEach((t) => (fixDebts[t] = getTokenInfoFromMmToken(t)));

    return {
        healthFactor: getHealthFactor(result.accountData.healthFactor),
        deposits,
        varDebts,
        fixDebts
    };
};

const RAY = BigNumber.from(10).pow(27);
const SECONDS_PER_YEAR = 31536000;
const calculateAPY = (rayValue: BigNumber): number => {
    const APR = rayValue.mul(10000).div(RAY).toNumber() / 10000;
    const APY = Math.pow(1 + APR / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1;
    return Math.round(APY * 10000) / 100;
};

const getHealthFactor = (rawHealthFactor: BigNumber): string =>
    rawHealthFactor.lt("100000000000000000000000000")
        ? bigNumberToFloat(rawHealthFactor).toString()
        : "∞";
