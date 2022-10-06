export interface IContractsList {
  // external
  IUniswapV2Router01: string;
  AavePriceOracle: string;

  // infrastructure
  DaemonsToken: string;
  GasTank: string;
  ILiquidityManager: string;
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

export const mumbaiTestnetContracts: IContractsList = {
  IUniswapV2Router01: "0x8954AfA98594b838bda56FE4C12a09D7739D179b",
  AavePriceOracle: "0x520D14AE678b41067f029Ad770E2870F85E76588",

  DaemonsToken: "0x9f82626CaD80b6C87ee681c21F1E46AFD5cE2222",
  GasTank: "0x9AE02Fd2B6386a987CF236AFe83912DA364be960",
  GasPriceFeed: "0xEfE5BB36d84024F03B185B018BB1217C4C7d46cB",
  Vesting: "0x395B6b68D7938794fa12fd5E4cDa1085940F806D",
  ILiquidityManager: "0x9e89E62b493204d7A6ED7FB0cfe3EA119B6d12fC",
  Treasury: "0x57C94936EE7cb649307b831c46D49Bd2391FCDfe",
  wethDaemLp: "0xe9a9bec138E331927625152d3f8495755ec68c36",
  InfoFetcher: "0xc19De6D8939fAD8eE1E4D5f3106D69126b8E8Ba6",

  SwapperScriptExecutor: "0xc36449d5A86668E941214d8B5661D9BaA1DE8b1D",
  TransferScriptExecutor: "0x3C676A86781d9D1D85583a8d6736D2588a9FD533",
  MmBaseScriptExecutor: "0xcDd54580Cb0EAD2e8A1bCF6Ea764E4CC11087395",
  MmAdvancedScriptExecutor: "0x052b877bAb05C6797443edDfF8D017f1e5024537",
  ZapInScriptExecutor: "0x9dAfD423cbE6c0BE3a6C4b2Eca39A95A939b327e",
  ZapOutScriptExecutor: "0x4f5a89f66ec13410A69Ce13303FBD0Ce94b201a6",
  BeefyScriptExecutor: "0xf1A63d37f733b14c05d0ef93ea887F53970b350A",
  PassScriptExecutor: "0x7830Cb147D8929a3214bfE6c1a77FF1C7Cc56E41"
};
