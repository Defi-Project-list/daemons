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
  InfoFetcher: string;

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
  InfoFetcher: "0x17a6FaA6b2ea29294c255a5b122C1808Ff582fba",

  SwapperScriptExecutor: "0x0f1D5120B765F0c99EF85bb4B6F90E90a9F0A3Dc",
  TransferScriptExecutor: "0x5913B9cBEBb41b295ecDDc31458c5a764E693eA2",
  MmBaseScriptExecutor: "0x2150c44623d98ecA67cD884e06D700be4064ed84",
  MmAdvancedScriptExecutor: "0xbE1733c714Fb9aD98A3dC35eeB1b041A422caC59",
  ZapInScriptExecutor: "0x2D736f1f0dc583C69af0fcc03Ba2d27bBf698472",
  ZapOutScriptExecutor: "0x13f53642981516Ad2f76dB2C423D2A7fE8610Ad5",
  BeefyScriptExecutor: "0x1E286f7D6B5ea61ab3531ef0EE91e4934e8158d5",
  PassScriptExecutor: "0xCF0dBE21805b7344Bb2E312AF2688538EbFbE1F5"
};

export const mumbaiTestnetContracts: IContractsList = {
  IUniswapV2Router01: "0x8954AfA98594b838bda56FE4C12a09D7739D179b",
  AavePriceOracle: "0x520D14AE678b41067f029Ad770E2870F85E76588",

  DaemonsToken: "0x46F388505b6ba78C5732346653F96a206A738d2B",
  GasTank: "0xbe6216682D743e414b119Af0AFBA91687685F099",
  Treasury: "0x7aa32870031c7F908618C31844220e28437398A0",
  Vesting: "0x6A60c533AF6A8250E59745dc416f794c9a28cE29",
  GasPriceFeed: "0x9d9c77B481003Edf8Db7AE82403d51cF113fe253",
  wethDaemLp: "0x8014d17F759553aE57648177a511feF5A9203a0C",
  InfoFetcher: "0x460ecd537e357890D3F888e92c5d5bF1452684bd",

  SwapperScriptExecutor: "0xEd1e3b9d6D66eA7c08778D52B684684a306A3B21",
  TransferScriptExecutor: "0x570c1a344BBEEB685b8C14D3B0a59Da3D967931E",
  MmBaseScriptExecutor: "0x29Ff4c4297694f8b67df46Fc42216c17dE57f9eB",
  MmAdvancedScriptExecutor: "0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136",
  ZapInScriptExecutor: "0x352e85070A57CdAACd00Bce9e0743fBa9B655105",
  ZapOutScriptExecutor: "0xF0AeB3144FAF215D0fB1d69687c6d8e0Ab198414",
  BeefyScriptExecutor: "0x4348567A201E534823bf54EA15b55a6B891721aA",
  PassScriptExecutor: "0x2827Ba91D27136Aba3e6ad30aA7D1e6D1ED4Dd66"
};
