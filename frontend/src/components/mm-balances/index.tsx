import React, { useEffect } from "react";
import { IToken, MoneyMarket } from "../../data/chains-data/interfaces";
import { RootState, useAppDispatch, useAppSelector } from "../../state";
import { fetchMmInfo } from "../../state/action-creators/wallet-action-creators";
import { successToast } from "../toaster";
import "./styles.css";

interface IMmBalancesProps {
    moneyMarket: MoneyMarket;
}

export const MmBalances = ({ moneyMarket }: IMmBalancesProps): JSX.Element => {
    const dispatch = useAppDispatch();
    const chainId = useAppSelector((state: RootState) => state.user.chainId)!;
    const address = useAppSelector((state: RootState) => state.user.address)!;
    const mmInfo = useAppSelector((state: RootState) => state.wallet.moneyMarketsInfo);

    const thisMM = mmInfo[moneyMarket.poolAddress];
    const depositedTokensInfo = thisMM ? Object.values(thisMM.deposits) : [];
    const varLoansInfo = thisMM ? Object.values(thisMM.varDebts) : [];
    const fixLoansInfo = thisMM ? Object.values(thisMM.fixDebts) : [];

    useEffect(() => {
        dispatch(fetchMmInfo(moneyMarket, address, chainId));
    }, []);

    return (
        <div className="mm-balances">
            {/* Header */}
            <div className="mm-balances__header">
                <div className="mm-balances__title">{moneyMarket.name} Status</div>
                <div
                    onClick={async () => {
                        dispatch(fetchMmInfo(moneyMarket, address, chainId));
                        successToast("MM info updated");
                    }}
                    className="wallet-state__reload-bt"
                />
            </div>
            {!!thisMM && (
                <div className="mm-balances__account-info">
                    <div>Health Factor: {thisMM.healthFactor}</div>
                    <div>Collateral value in ETH: {thisMM.collateralEth}</div>
                    <div>Debts value in ETH: {thisMM.debtEth}</div>
                    <div>Borrowable in ETH: {thisMM.borrowableEth}</div>
                </div>
            )}

            {/* Deposits */}
            <div className="mm-balances__subsection">Deposits</div>
            <div className="mm-balances__tokens-list">
                {depositedTokensInfo.length > 0 ? (
                    depositedTokensInfo
                        .filter((t) => t.balance > 0)
                        .map((t) => (
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
                    varLoansInfo
                        .filter((t) => t.balance > 0)
                        .map((t) => (
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
                    fixLoansInfo
                        .filter((t) => t.balance > 0)
                        .map((t) => (
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
