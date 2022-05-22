import { rinkebyContracts } from "@daemons-fi/addresses/build";
import { IChainInfo } from "../interfaces";
import { AaveMMAdvancedAction, AaveMMBaseAction, SwapAction, TransferAction } from "./action-forms";
import { rinkebyTokens } from "./tokens";

export const rinkebyInfo: IChainInfo = {
    name: "Rinkeby",
    id: "4",
    hex: "0x4",
    defaultRPC: "https://rinkeby.infura.io/v3/",
    iconPath: "/icons/rinkeby.jpg",
    coinName: "Ether",
    coinSymbol: "ETH",
    coinDecimals: 18,
    explorerUrl: "https://rinkeby.etherscan.io/",
    explorerTxUrl: "https://rinkeby.etherscan.io/tx/",
    tokens: rinkebyTokens,
    contracts: rinkebyContracts,
    actions: [TransferAction, SwapAction, AaveMMBaseAction, AaveMMAdvancedAction]
};
