import { IContractsList } from "@daemons-fi/addresses/build";
import { IChainInfo } from "../interfaces";

const unsupportedContracts: IContractsList = {
    IUniswapV2Router01: "",
    AavePriceOracle: "",

    GasTank: "",
    DaemonsToken: "",
    Treasury: "",
    GasPriceFeed: "",
    Vesting: "",
    wethDaemLp: "",

    SwapperScriptExecutor: "",
    TransferScriptExecutor: "",
    MmBaseScriptExecutor: "",
    MmAdvancedScriptExecutor: "",
    ZapInScriptExecutor: "",
    ZapOutScriptExecutor: "",
    BeefyScriptExecutor: ""
};

export const unsupportedChain: IChainInfo = {
    name: "Unsupported",
    id: "-1",
    hex: "0x00",
    defaultRPC: "",
    iconPath: "/icons/unknown.png",
    coinName: "Ether",
    coinSymbol: "ETH",
    coinDecimals: 18,
    explorerUrl: "https://kovan.etherscan.io/",
    explorerTxUrl: "https://kovan.etherscan.io/tx/",
    tokens: [],
    dexes: [],
    beefyMoos: {},
    contracts: unsupportedContracts,
    actions: []
};
