import React from "react";
import { GetCurrentChainTokensDictionary } from "../../data/chain-info";
import { IToken } from "../../data/chains-data/interfaces";
import { RootState, useAppDispatch, useAppSelector } from "../../state";
import { fetchTokenBalances } from "../../state/action-creators/wallet-action-creators";
import { successToast } from "../toaster";
import "./styles.css";

export const TokenBalances = (): JSX.Element => {
    const dispatch = useAppDispatch();
    const balances = useAppSelector((state: RootState) => state.wallet.tokenBalances);
    const chainId = useAppSelector((state: RootState) => state.user.chainId);
    const address = useAppSelector((state: RootState) => state.user.address);

    const tokens = GetCurrentChainTokensDictionary(chainId!);
    const triggerReload = async () => {
        dispatch(fetchTokenBalances(address, chainId));
        successToast("Token balances updated!");
    };
    const ownedTokens = Object.keys(balances)
        .filter((address) => tokens[address])
        .filter((address) => balances[address] > 0);

    return (
        <div className="token-balances">
            {/* Header */}
            <div className="token-balances__header">
                <div className="token-balances__title">Balances</div>
                <div onClick={triggerReload} className={`wallet-state__reload-bt`} />
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
