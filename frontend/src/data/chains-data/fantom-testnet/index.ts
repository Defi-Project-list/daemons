import { fantomTestnetContracts } from "@daemons-fi/addresses/build";
import { IChainInfo } from "../interfaces";
import {
    AaveMMAdvancedAction,
    AaveMMBaseAction,
    PassAction,
    SwapAction,
    TransferAction,
    ZapInAction,
    ZapOutAction
} from "./action-forms";
import { fantomTestnetDexes, fantomTestnetTokens } from "./tokens";

export const fantomTestnetInfo: IChainInfo = {
    name: "FantomTestnet",
    id: "4002",
    hex: "0xfa2",
    defaultRPC: "https://rpc.testnet.fantom.network/",
    iconPath: "/icons/fantom.jpg",
    coinName: "Fantom",
    coinSymbol: "FTM",
    coinDecimals: 18,
    coinIconPath: "https://tokens.1inch.io/0x4e15361fd6b4bb609fa63c81a2be19d873717870.png",
    explorerUrl: "https://testnet.ftmscan.com/",
    explorerTxUrl: "https://testnet.ftmscan.com/tx/",
    tokens: fantomTestnetTokens,
    dexes: fantomTestnetDexes,
    beefyMoos: {},
    contracts: fantomTestnetContracts,
    actions: [
        TransferAction,
        SwapAction,
        AaveMMBaseAction,
        AaveMMAdvancedAction,
        ZapInAction,
        ZapOutAction,
        PassAction
    ]
};
