import { IChainInfo, IContractsList } from "../interfaces";
import { AaveMMAdvancedAction, AaveMMBaseAction, SwapAction, TransferAction } from "./action-forms";
import { rinkebyTokens } from "./tokens";

const rinkebyContracts: IContractsList = {
    PriceRetriever: "0xf679088D6f27A7F8F28e1A4642461FB65337704D",
    DAEMToken: "0x7bF06253416bE429414d62C60cc413d2bFfdE8FC",
    GasTank: "0x51d04DbB19C4133D1c573992296D71Dc01e35aD7",
    Treasury: "0xCfa3852Dad56211B3Cbf6270b720AD8367F87bD5",
    GasPriceFeed: "0x419CF7c2a9B0F60C5C84aBD6F2FBDCF177dEdcCC",

    SwapExecutor: "0x570c1a344BBEEB685b8C14D3B0a59Da3D967931E",
    TransferExecutor: "0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136",
    MmBaseExecutor: "0x09c89F158A3fF7A2A3c3DcCdF77E8D8761946684",
    MmAdvancedExecutor: "0xAB3B0A5631E10786a19F950FD73af7b6724111AA"
};

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
