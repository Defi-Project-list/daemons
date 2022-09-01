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

export const kovanContracts: IContractsList = {
  IUniswapV2Router01: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  AavePriceOracle: "0xb8be51e6563bb312cbb2aa26e352516c25c26ac1",

  DaemonsToken: "0x4Cd886EC614D54187E7CfB08f2c02Fd0C53582E4",
  GasTank: "0xa6995d60b31C57b0F359Bf10E53a7700147b570f",
  GasPriceFeed: "0xb6F625627642CDAf56b71289BccDEd7ed0bbe0b7",
  Vesting: "0xaa87508E9a46aFDcA8B238F9e581e26c686e86d2",
  ILiquidityManager: "0xA0F0ee9A685B8C53615E5d0E79DF081BdFA4a6F0",
  Treasury: "0x63f457074b1A1889d68c39D20Ca5802E1dD43044",
  wethDaemLp: "0x5528272943599533F76b6d97e1ebfB4FAa461afB",
  InfoFetcher: "0x94842ee7a691AC3CdA616a4f9E8385258BE4FaFE",

  SwapperScriptExecutor: "0xc9157bA9bF8Ed1200c31bec914C02888A9e624a6",
  TransferScriptExecutor: "0x7F6F78F6e6ff610014223844F3a268A82Fbaed65",
  MmBaseScriptExecutor: "0xda9Cbfa4C60b5190C2702a466726D9c514Df145e",
  MmAdvancedScriptExecutor: "0xB99991634c33D4E1B09ff57E922823b3807ce601",
  ZapInScriptExecutor: "0xc18567f3e43Ea907552979967FfC9f48dF9B177b",
  ZapOutScriptExecutor: "0xf4970Baa7B2520d0FD4744bf372e96a56bde247B",
  BeefyScriptExecutor: "0x1E286f7D6B5ea61ab3531ef0EE91e4934e8158d5",
  PassScriptExecutor: "0xA0f11D2d40A2693BA4F536b5154d4082484e2dfA"
};

export const mumbaiTestnetContracts: IContractsList = {
  IUniswapV2Router01: "0x8954AfA98594b838bda56FE4C12a09D7739D179b",
  AavePriceOracle: "0x520D14AE678b41067f029Ad770E2870F85E76588",

  DaemonsToken: "0x9f82626CaD80b6C87ee681c21F1E46AFD5cE2222",
  GasTank: "0x9AE02Fd2B6386a987CF236AFe83912DA364be960",
  GasPriceFeed: "0xEfE5BB36d84024F03B185B018BB1217C4C7d46cB",
  Vesting: "0x395B6b68D7938794fa12fd5E4cDa1085940F806D",
  ILiquidityManager: "0x630f83BDd1189cDc23f2B10307E6D84d385Ba87f",
  Treasury: "0x57C94936EE7cb649307b831c46D49Bd2391FCDfe",
  wethDaemLp: "0xe9a9bec138E331927625152d3f8495755ec68c36",
  InfoFetcher: "0x05Af9c3a34c9453e997ad73aBD6A65afCc75411B",

  SwapperScriptExecutor: "0xc36449d5A86668E941214d8B5661D9BaA1DE8b1D",
  TransferScriptExecutor: "0x3C676A86781d9D1D85583a8d6736D2588a9FD533",
  MmBaseScriptExecutor: "0xcDd54580Cb0EAD2e8A1bCF6Ea764E4CC11087395",
  MmAdvancedScriptExecutor: "0x052b877bAb05C6797443edDfF8D017f1e5024537",
  ZapInScriptExecutor: "0x9dAfD423cbE6c0BE3a6C4b2Eca39A95A939b327e",
  ZapOutScriptExecutor: "0x4f5a89f66ec13410A69Ce13303FBD0Ce94b201a6",
  BeefyScriptExecutor: "0xf1A63d37f733b14c05d0ef93ea887F53970b350A",
  PassScriptExecutor: "0x7830Cb147D8929a3214bfE6c1a77FF1C7Cc56E41"
};
