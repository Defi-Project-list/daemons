import { Contract } from "ethers";
import { ethers } from "hardhat";

export type DaemonsContracts = { [contractName: string]: string };
export const contracts: { [chainId: number]: DaemonsContracts } = {
    // Kovan
    42: {
        IUniswapV2Router01: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        AavePriceOracle: "0xb8be51e6563bb312cbb2aa26e352516c25c26ac1",
        DaemonsToken: "0xd03cB2b4EEE716bDfE520F3a5114E1663f246FAA",
        GasTank: "0xFaE02983d635945a124248Dd32Ae4702eFd4c61d",
        Treasury: "0xd14a12C34532D0f4D3b6986eC3122ad2E8e4337c",
        Vesting: "0x42105A2460e73Ea1a03eCC445c66Ef1847deBB1d",
        GasPriceFeed: "0x0Ec6553ddbCF6Ecc63439e98aD486267541Ca79A",
        wethDaemLp: "0xf376ee979501Bc326ac3Edc429D8a01BFf557d81",
        SwapperScriptExecutor: "0x58Cb89cC302CC471D45C19288d09FFBEf7dfa72E",
        TransferScriptExecutor: "0x63C4f5D53194b78893A72B39A7ba96757E53ae1C",
        MmBaseScriptExecutor: "0x4d721528a4C0A43BF8Fc27fF9E5b723c6522d043",
        MmAdvancedScriptExecutor: "0x1407e910ed0d7E31B4a4e29d8EF841B7E79d5a27",
        ZapInScriptExecutor: "0x9a7C195cEEd99a49CAb36e77Af926ffEE86D6c05",
        ZapOutScriptExecutor: "0x78C46E327f6A341F03cC9B0854376BC7C3198340",
        BeefyScriptExecutor: "0x0EE74e6028E76D63cE4A041c11763cb947786C40",
        PassScriptExecutor: "0x0aF8a5c3C6cB81384BB3A8EB2170A06dFfe88Ba5"
    },
    // Fantom Testnet
    4002: {
        IUniswapV2Router01: "0xa6AD18C2aC47803E193F75c3677b14BF19B94883",
        AavePriceOracle: "0xA840C768f7143495790eC8dc2D5f32B71B6Dc113",
        DaemonsToken: "0x1D690294e52d351D25815d4d15154494cF6B8849",
        GasTank: "0x31B6b929a574c47A27cC8a67E71B73ee0c97c79F",
        Treasury: "0x911C8D6D327d202dF815Ff4bd053B9BC7ceF6d7D",
        Vesting: "0x979C0Dde04BA2e178C156409ddec6AFc83061778",
        GasPriceFeed: "0x538016e12F6cDb8Eef20d679BFB776b42e4fa12C",
        wethDaemLp: "0x2407fC2E06753d4daD48689eB0a3f8B780f0aEdD",
        SwapperScriptExecutor: "0xA797320805f3A696a1C359B33c7A4d6CF4FC9EB5",
        TransferScriptExecutor: "0x4e8A18c8F540B5E960CE6D3F1A5c404d4071C4a5",
        MmBaseScriptExecutor: "0xB4731c92a83048c28777e73F9A5D599280a88201",
        MmAdvancedScriptExecutor: "0x222065698c4D55b1e3d0BcA95E3d826126F978E4",
        ZapInScriptExecutor: "0x1f425edE1C610C6d5C5bc5E6a6B2De7386914FA7",
        ZapOutScriptExecutor: "0xA3002b7Fce6da7FEFA9E6a54b71Bf6aeA669b16d",
        BeefyScriptExecutor: "0x278D07328fD1B0FB42aAFefEF0B56a94FAfD52CA",
        PassScriptExecutor: "0x03cD800b97bA2B541eD7920d3251D50abfFd3d8e",
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
