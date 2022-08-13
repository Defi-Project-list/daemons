import { Contract } from "ethers";
import { ethers } from "hardhat";

export type DaemonsContracts = { [contractName: string]: string };
export const contracts: { [chainId: number]: DaemonsContracts } = {
    // Kovan
    42: {
        IUniswapV2Router01: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        AavePriceOracle: "0xb8be51e6563bb312cbb2aa26e352516c25c26ac1",
        DaemonsToken: "0x2E7a2a132b746896ff379490004580f7ecaD8aCa",
        GasTank: "0x1c0821200597DD6fA369E7590D8cd4aDbEBAac41",
        Treasury: "0xC346CaEd0C469f26824ef913A79799b931d0a068",
        Vesting: "0x7B84b2B56eF772B73cF8750F2fb9947Bc2feD428",
        GasPriceFeed: "0x17cc88BF8B7CEf37Fc8F3A9d7d3C57E97f862Af3",
        wethDaemLp: "0xFF082872eaaDbA1006B9C428fcfE9cA3246c762d",
        InfoFetcher: "0x81add7263E2fDAbdcc8d0cd07765C0519A75E735",
        SwapperScriptExecutor: "0x0f1D5120B765F0c99EF85bb4B6F90E90a9F0A3Dc",
        TransferScriptExecutor: "0x5913B9cBEBb41b295ecDDc31458c5a764E693eA2",
        MmBaseScriptExecutor: "0x2150c44623d98ecA67cD884e06D700be4064ed84",
        MmAdvancedScriptExecutor: "0xbE1733c714Fb9aD98A3dC35eeB1b041A422caC59",
        ZapInScriptExecutor: "0x2D736f1f0dc583C69af0fcc03Ba2d27bBf698472",
        ZapOutScriptExecutor: "0x13f53642981516Ad2f76dB2C423D2A7fE8610Ad5",
        BeefyScriptExecutor: "0x1E286f7D6B5ea61ab3531ef0EE91e4934e8158d5",
        PassScriptExecutor: "0xCF0dBE21805b7344Bb2E312AF2688538EbFbE1F5"
    },
    // Fantom Testnet
    4002: {
        IUniswapV2Router01: "0xa6AD18C2aC47803E193F75c3677b14BF19B94883",
        AavePriceOracle: "0xA840C768f7143495790eC8dc2D5f32B71B6Dc113",
        DaemonsToken: "0x966f8Fead33e50762747F1E90C29709D4F4Ff0A5",
        GasTank: "0x44954311524EC2a2bb2AA978BEc57c8aBaC6663d",
        Treasury: "0x4a0bffeC8B433B31B858dC214ed074f613743df9",
        Vesting: "0x2788553B577669fd4d5cc3AaB4F10054c9b803A2",
        GasPriceFeed: "0x5773649d94Fd3895c194EA8eFe4CF420f2dC5278",
        wethDaemLp: "0xeE262e0B56513E26aE961549Cf60D23404AF262A",
        InfoFetcher: "0x42CB200cECDad84142A2cCbaC4D0FFA8492f7Fc6",
        SwapperScriptExecutor: "0x63267ADD09A97f2ceC5669C85F020e48aA381002",
        TransferScriptExecutor: "0x6381bDA2FF150FD0e0504c065301546f9cF7b034",
        MmBaseScriptExecutor: "0x227Def9c9a44dD621Db7c7dCA8090E004cd69436",
        MmAdvancedScriptExecutor: "0x3050EeC643E075ee62559b1D84aaeEBbC78A44E5",
        ZapInScriptExecutor: "0xaf27157d4A68AE6bb20d05F8e64226BDB5249E9F",
        ZapOutScriptExecutor: "0x1D1C531AF86CA26A11fE305CA9764628Fb7314d7",
        BeefyScriptExecutor: "0x69ccf384DCB3639127Ab4bD21b8A6c89Ea389bDb",
        PassScriptExecutor: "0x0e0dDdDA9089d0dc23935cD69B55ccf8B7A147a5"
    },
    // Mumbai Testnet
    80001: {
        IUniswapV2Router01: "0x8954AfA98594b838bda56FE4C12a09D7739D179b",
        AavePriceOracle: "0x520D14AE678b41067f029Ad770E2870F85E76588",
        DaemonsToken: "0x46F388505b6ba78C5732346653F96a206A738d2B",
        GasTank: "0xbe6216682D743e414b119Af0AFBA91687685F099",
        Treasury: "0x7aa32870031c7F908618C31844220e28437398A0",
        Vesting: "0x6A60c533AF6A8250E59745dc416f794c9a28cE29",
        GasPriceFeed: "0x9d9c77B481003Edf8Db7AE82403d51cF113fe253",
        wethDaemLp: "0x8014d17F759553aE57648177a511feF5A9203a0C",
        InfoFetcher: "0xeE3a4b1D82947873cDAb80022F377c5136538FfF",
        SwapperScriptExecutor: "0xEd1e3b9d6D66eA7c08778D52B684684a306A3B21",
        TransferScriptExecutor: "0x570c1a344BBEEB685b8C14D3B0a59Da3D967931E",
        MmBaseScriptExecutor: "0x29Ff4c4297694f8b67df46Fc42216c17dE57f9eB",
        MmAdvancedScriptExecutor: "0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136",
        ZapInScriptExecutor: "0x352e85070A57CdAACd00Bce9e0743fBa9B655105",
        ZapOutScriptExecutor: "0xF0AeB3144FAF215D0fB1d69687c6d8e0Ab198414",
        BeefyScriptExecutor: "0x4348567A201E534823bf54EA15b55a6B891721aA",
        PassScriptExecutor: "0x2827Ba91D27136Aba3e6ad30aA7D1e6D1ED4Dd66"
    }
};

export const getContractAddress = (contracts: DaemonsContracts, contractName: string): string => {
    const address: string | undefined = contracts[contractName];
    if (!address) throw new Error(`Could not find address for contract ${contractName}`);
    return address;
};

export const getContract = async (
    contracts: DaemonsContracts,
    contractName: string
): Promise<Contract> => {
    const address = getContractAddress(contracts, contractName);
    return await ethers.getContractAt(contractName, address);
};

export const updateContracts = (
    contracts: DaemonsContracts,
    contractName: string,
    contractAddress: string
): DaemonsContracts => {
    const copyOfContracts = JSON.parse(JSON.stringify(contracts));
    copyOfContracts[contractName] = contractAddress;
    console.log(`Contracts updated:`);
    printContracts(copyOfContracts);
    return copyOfContracts;
};

export const printContracts = (contracts: DaemonsContracts): void => {
    Object.keys(contracts).forEach((k) => console.log(`"${k}": "${contracts[k]}",`));
};
