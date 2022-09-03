import { kovanContracts } from "@daemons-fi/contracts";
import { IChainInfo } from "../interfaces";
import {
    AaveMMAdvancedAction,
    AaveMMBaseAction,
    BeefyAction,
    PassAction,
    SwapAction,
    TransferAction,
    ZapInAction,
    ZapOutAction
} from "./action-forms";
import { kovanAaveMM, kovanDexes, kovanSwapTokens, kovanTokens } from "./tokens";

export const kovanInfo: IChainInfo = {
    name: "Kovan",
    id: "42",
    hex: "0x2a",
    defaultRPC: "https://kovan.infura.io/v3/",
    iconPath: "/icons/kovan.jpg",
    coinName: "Ether",
    coinSymbol: "ETH",
    coinDecimals: 18,
    coinIconPath: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    explorerUrl: "https://kovan.etherscan.io/",
    explorerTxUrl: "https://kovan.etherscan.io/tx/",
    tokens: kovanTokens,
    swapTokens: kovanSwapTokens,
    dexes: kovanDexes,
    moneyMarkets: [kovanAaveMM],
    beefyMoos: {
        "0xc627AccC7843d5A18260F860567B5Ea15b88a330": "0xc627AccC7843d5A18260F860567B5Ea15b88a330"
    },
    contracts: kovanContracts,
    actions: [
        TransferAction,
        SwapAction,
        AaveMMBaseAction,
        AaveMMAdvancedAction,
        ZapInAction,
        ZapOutAction,
        BeefyAction,
        PassAction
    ]
};
