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

    DaemonsToken: "0x8Ff3453762a6baD21061045dEA80cc4CDade1166",
    GasTank: "0x59A815823185A7286193b7E2B003b6D2d5303617",
    Treasury: "0x936F81037dB3308B9Ab47439f4318E0B4F531eBE",
    Vesting: "0xE4D2b368aB0ff6d74949651a7B8338474e2da81b",
    GasPriceFeed: "0x685eAFEE0bc6711a11a86644A88fb9F1c62Fc4E4",
    wethDaemLp: "0x50041619f13FEc3539FA7ef3fa3280F438B16C75",

    SwapperScriptExecutor: "0xD0BE5E96Deba8C3dda5b3c9abE8310c5e3C610ff",
    TransferScriptExecutor: "0xc67dA8b1F15D1F6D9aCE5D7982b62BCBd32FaBF2",
    MmBaseScriptExecutor: "0x3F7Cb6E0450A055DaE092BF24Ff33c8c1F182E98",
    MmAdvancedScriptExecutor: "0xa09A8aD6d1b7611bdCB63616a51DA4d007e0F319",
    ZapInScriptExecutor: "0x075b42126c0B4439188553B3AA465213B4A0D692",
    ZapOutScriptExecutor: "0x41f250286a122E90962806F0CFaFF98E3E2dFc00",
    BeefyScriptExecutor: "0xef443819F6fBd800e5BdA2b06DE909b08A41f05A",
    PassScriptExecutor: "0x914176528E612feDE6724da800d5ba5279da0519"
};

export const fantomTestnetContracts: IContractsList = {
    IUniswapV2Router01: "0xa6AD18C2aC47803E193F75c3677b14BF19B94883",
    AavePriceOracle: "0xA840C768f7143495790eC8dc2D5f32B71B6Dc113",

    DaemonsToken: "0x4fA501E1a6eca6e8678eb7Fd82C4BdbCf22617CE",
    GasTank: "0xD8EF692cC34810d87db9eE804b4F2000d2835145",
    Treasury: "0x5385bb810e11d3A296c74366EFB671D48A7178be",
    Vesting: "0x4f10A4b2322D9531031Fd90A598bE86ee3886714",
    GasPriceFeed: "0xDb9E75452f5c0dffE671927216bF07A3CD9B3E43",
    wethDaemLp: "0xaB9d55913a936AD7B50fe9FcdDD6F87450689766",

    SwapperScriptExecutor: "0xD08DB5fB9B40D1BDb1bB1EBfeCe9B83C0EBb99dd",
    TransferScriptExecutor: "0x7413d2FB8AaA80a559184ec87CcdA7e25c492f6d",
    MmBaseScriptExecutor: "0xF6A3AcF0e2772E174d10b8724233222B62010e79",
    MmAdvancedScriptExecutor: "0x8179a233e317D3fDD62415E4f32F421CBe902D28",
    ZapInScriptExecutor: "0x2D2c3Fa1f651Bd414dE7539E02D820C8Cf871953",
    ZapOutScriptExecutor: "0x3d30536D78F14a3Ec6996c32C48b30F194173ac8",
    BeefyScriptExecutor: "0x1d4bb9062ab87Aa8Fe3D1b48521e349712D79542",
    PassScriptExecutor: "0xa66095db0703eD66461fB8FfB3bd4442bAB203De"
};
