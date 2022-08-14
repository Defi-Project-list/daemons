import React, { useState } from "react";
import { useSelector } from "react-redux";
import { GetCurrentChainTokensDictionary } from "../../data/chain-info";
import { IToken } from "../../data/chains-data/interfaces";
import { RootState } from "../../state";
import "./styles.css";

export const TokenBalances = (): JSX.Element => {
    const balances = useSelector((state: RootState) => state.wallet.balances);
    const chainId = useSelector((state: RootState) => state.user.chainId);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const tokens = GetCurrentChainTokensDictionary(chainId!);
    const triggerReload = async () => {};
    const ownedTokens = Object.keys(balances)
        .filter((address) => tokens[address])
        .filter((address) => balances[address] > 0);

    return (
        <div className="token-balances">
            {/* Header */}
            <div className="token-balances__header">
                <div className="token-balances__title">Balances</div>
                <div
                    onClick={triggerReload}
                    className={`token-balances__reload ${
                        isLoading ? "token-balances__reload--loading" : ""
                    }`}
                />
            </div>

            {/* Tokens List */}
            <div className="token-balances__tokens-list">
                {ownedTokens.length > 0 ? (
                    ownedTokens.map((address) => (
                        <TokenWithBalance
                            key={tokens[address].address}
                            token={tokens[address]}
                            balance={balances[address] ?? 0}
                        />
                    ))
                ) : (
                    <div className="token-balances__empty">
                        <div className="token-balances__empty-icon" />
                        <div className="token-balances__empty-text">Couldn't find any token...</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TokenWithBalance = ({ token, balance }: { token: IToken; balance: number }): JSX.Element => (
    <div className="token-with-balance">
        <img className="token-with-balance__img" src={token.logoURI} />
        <div className="token-with-balance__name">{token.symbol}</div>
        <div className="token-with-balance__balance">{balance}</div>
    </div>
);
