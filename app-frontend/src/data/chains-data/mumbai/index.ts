import { mumbaiTestnetContracts } from "@daemons-fi/contracts";
import { IChainInfo } from "../interfaces";
import {
    AaveMMAdvancedAction,
    AaveMMBaseAction,
    BeefyAction,
    PassAction,
    QuickSwapAction,
    SushiSwapAction,
    TransferAction,
    ZapInAction,
    ZapOutAction
} from "./action-forms";
import { mumbaiAaveMM, mumbaiDexes, mumbaiSwapTokens, mumbaiTokens } from "./tokens";

export const mumbaiInfo: IChainInfo = {
    name: "Mumbai",
    id: "80001",
    hex: "0x13881",
    defaultRPC: "https://rpc-mumbai.maticvigil.com",
    iconPath: "/icons/mumbai.jpg",
    coinName: "Matic",
    coinSymbol: "MATIC",
    coinDecimals: 18,
    coinIconPath: "/icons/polygon.jpg",
    explorerUrl: "https://mumbai.polygonscan.com/",
    explorerTxUrl: "https://mumbai.polygonscan.com/tx/",
    tokens: mumbaiTokens,
    swapTokens: mumbaiSwapTokens,
    dexes: mumbaiDexes,
    moneyMarkets: [mumbaiAaveMM],
    beefyMoos: {
        "0xc627AccC7843d5A18260F860567B5Ea15b88a330": "0xc627AccC7843d5A18260F860567B5Ea15b88a330"
    },
    contracts: mumbaiTestnetContracts,
    actions: [
        TransferAction,
        QuickSwapAction,
        SushiSwapAction,
        AaveMMBaseAction,
        AaveMMAdvancedAction,
        ZapInAction,
        ZapOutAction,
        BeefyAction,
        PassAction
    ]
};
