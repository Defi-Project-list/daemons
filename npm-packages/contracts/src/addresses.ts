export interface IContractsList {
    // external
    IUniswapV2Router01: string;
    AavePriceOracle: string;

    // infrastructure
    DaemonsToken: string;
    GasTank: string;
    Treasury: string;
    Vesting: string;
    GasPriceFeed: string;
    wethDaemLp: string;

    // executors
    SwapperScriptExecutor: string;
    TransferScriptExecutor: string;
    MmBaseScriptExecutor: string;
    MmAdvancedScriptExecutor: string;
    ZapInScriptExecutor: string;
    ZapOutScriptExecutor: string;
    BeefyScriptExecutor?: string;
    PassScriptExecutor: string;
}

export const kovanContracts: IContractsList = {
    IUniswapV2Router01: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    AavePriceOracle: "0xb8be51e6563bb312cbb2aa26e352516c25c26ac1",

    DaemonsToken: "0x2E7a2a132b746896ff379490004580f7ecaD8aCa",
    GasTank: "0x1c0821200597DD6fA369E7590D8cd4aDbEBAac41",
    Treasury: "0xC346CaEd0C469f26824ef913A79799b931d0a068",
    Vesting: "0x7B84b2B56eF772B73cF8750F2fb9947Bc2feD428",
    GasPriceFeed: "0x17cc88BF8B7CEf37Fc8F3A9d7d3C57E97f862Af3",
    wethDaemLp: "0xFF082872eaaDbA1006B9C428fcfE9cA3246c762d",

    SwapperScriptExecutor: "0x0f1D5120B765F0c99EF85bb4B6F90E90a9F0A3Dc",
    TransferScriptExecutor: "0x5913B9cBEBb41b295ecDDc31458c5a764E693eA2",
    MmBaseScriptExecutor: "0x2150c44623d98ecA67cD884e06D700be4064ed84",
    MmAdvancedScriptExecutor: "0xbE1733c714Fb9aD98A3dC35eeB1b041A422caC59",
    ZapInScriptExecutor: "0x2D736f1f0dc583C69af0fcc03Ba2d27bBf698472",
    ZapOutScriptExecutor: "0x13f53642981516Ad2f76dB2C423D2A7fE8610Ad5",
    BeefyScriptExecutor: "0x1E286f7D6B5ea61ab3531ef0EE91e4934e8158d5",
    PassScriptExecutor: "0xCF0dBE21805b7344Bb2E312AF2688538EbFbE1F5"
};

export const fantomTestnetContracts: IContractsList = {
    IUniswapV2Router01: "0xa6AD18C2aC47803E193F75c3677b14BF19B94883",
    AavePriceOracle: "0xA840C768f7143495790eC8dc2D5f32B71B6Dc113",

    DaemonsToken: "0x966f8Fead33e50762747F1E90C29709D4F4Ff0A5",
    GasTank: "0x44954311524EC2a2bb2AA978BEc57c8aBaC6663d",
    Treasury: "0x4a0bffeC8B433B31B858dC214ed074f613743df9",
    Vesting: "0x2788553B577669fd4d5cc3AaB4F10054c9b803A2",
    GasPriceFeed: "0x5773649d94Fd3895c194EA8eFe4CF420f2dC5278",
    wethDaemLp: "0xeE262e0B56513E26aE961549Cf60D23404AF262A",

    SwapperScriptExecutor: "0x63267ADD09A97f2ceC5669C85F020e48aA381002",
    TransferScriptExecutor: "0x6381bDA2FF150FD0e0504c065301546f9cF7b034",
    MmBaseScriptExecutor: "0x227Def9c9a44dD621Db7c7dCA8090E004cd69436",
    MmAdvancedScriptExecutor: "0x3050EeC643E075ee62559b1D84aaeEBbC78A44E5",
    ZapInScriptExecutor: "0xaf27157d4A68AE6bb20d05F8e64226BDB5249E9F",
    ZapOutScriptExecutor: "0x1D1C531AF86CA26A11fE305CA9764628Fb7314d7",
    BeefyScriptExecutor: "0x69ccf384DCB3639127Ab4bD21b8A6c89Ea389bDb",
    PassScriptExecutor: "0x0e0dDdDA9089d0dc23935cD69B55ccf8B7A147a5"
};
