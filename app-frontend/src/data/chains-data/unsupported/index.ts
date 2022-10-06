import { IContractsList } from "@daemons-fi/contracts";
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
    ILiquidityManager: "",
    InfoFetcher: "",

    SwapperScriptExecutor: "",
    TransferScriptExecutor: "",
    MmBaseScriptExecutor: "",
    MmAdvancedScriptExecutor: "",
    ZapInScriptExecutor: "",
    ZapOutScriptExecutor: "",
    BeefyScriptExecutor: "",
    PassScriptExecutor: ""
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
    coinIconPath: "/icons/unknown.png",
    explorerUrl: "https://watevah.etherscan.io/",
    explorerTxUrl: "https://watevah.etherscan.io/tx/",
    tokens: [],
    swapTokens: [],
    dexes: [],
    moneyMarkets: [],
    beefyMoos: {},
    contracts: unsupportedContracts,
    actions: []
};
