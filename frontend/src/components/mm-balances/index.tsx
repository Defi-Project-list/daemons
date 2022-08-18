import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IToken, MoneyMarket } from "../../data/chains-data/interfaces";
import { RootState } from "../../state";
import { fetchMmInfo } from "../../state/action-creators/wallet-action-creators";
import { successToast } from "../toaster";
import "./styles.css";

interface IMmBalancesProps {
    moneyMarket: MoneyMarket;
}

export const MmBalances = ({ moneyMarket }: IMmBalancesProps): JSX.Element => {
    const dispatch = useDispatch();
    const chainId = useSelector((state: RootState) => state.user.chainId)!;
    const address = useSelector((state: RootState) => state.user.address)!;
    const mmInfo = useSelector((state: RootState) => state.wallet.moneyMarketsInfo);

    console.log(mmInfo);

    const thisMM = mmInfo[moneyMarket.poolAddress];
    const healthFactor = thisMM?.healthFactor;
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
