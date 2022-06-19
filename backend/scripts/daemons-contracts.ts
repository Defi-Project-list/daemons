import { Contract } from "ethers";
import { ethers } from "hardhat";

export type DaemonsContracts = { [contractName: string]: string };
export const contracts: { [chainId: number]: DaemonsContracts } = {
    // Kovan
    42: {
        IUniswapV2Router01: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        AavePriceOracle: "0xb8be51e6563bb312cbb2aa26e352516c25c26ac1",
        DaemonsToken: "0x5ef32D9ee682bad5F27B5baff54Cb74AbcCE984B",
        GasTank: "0x904055a23980796D9D18643aaB601fdeE8fc9757",
        Treasury: "0xA0E744D8Ebb5389a176058ecA02B9fDeD6975790",
        Vesting: "0xf73Ae502cb30406eBe5f8f296eab7eC6315cde32",
        GasPriceFeed: "0xFa0a7D790f76115375915e13272A138a8988FC8f",
        wethDaemLp: "0xe2A309667b1bB73199A259f558eeE1896a0A3B38",
        SwapperScriptExecutor: "0x5a7E0B41FaB98C5FF6aD82B0e07Ef1edd9e5f19c",
        TransferScriptExecutor: "0x288fA4ddc71133B0c6aA2e4d23334498c4ABf17c",
        MmBaseScriptExecutor: "0xaeA765b56B55BF8c8E499E3779D0e9078b2685c8",
        MmAdvancedScriptExecutor: "0xA2a2d767Ef7Cfc56477c22dc91AC3Ddb143331E2",
        ZapInScriptExecutor: "0xA67CF849e202B5425b4dc66901a23268D6e06d05",
        ZapOutScriptExecutor: "0xf9874541C9f4288f3d32f84A7bcb35821E049df0"
    },
    // Fantom Testnet
    4002: {
        IUniswapV2Router01: "0xa6AD18C2aC47803E193F75c3677b14BF19B94883",
        AavePriceOracle: "0xA840C768f7143495790eC8dc2D5f32B71B6Dc113",
        DaemonsToken: "0xa75900C86e0786867e00c58ba9a063C64bc29F50",
        GasTank: "0x022d1a4EC0B1Cc1750Cc4edaB788ABC505E0FEdb",
        Treasury: "0x1a8a6f0591564bE6F0700bCf65Fc2fec576ddB61",
        Vesting: "0x7E593c1f2dAA27bE2aE23975866D1Aeb394CC0a1",
        GasPriceFeed: "0xfdBb077349d89Bd6C13038d906B5e5cB848eA7eB",
        wethDaemLp: "0xB3288F9C6d28876cBe9eada94a17eDb212fEc969",
        SwapperScriptExecutor: "0x1125599412b1a830afD81996F0335D31d68a60A0",
        TransferScriptExecutor: "0x672a8F6A07C612533E76c363Fb3e2BA051d403A7",
        MmBaseScriptExecutor: "0x481e74117F2225D458C082C18dA5D3eF3Bc6913A",
        MmAdvancedScriptExecutor: "0x3b1a45765b4fF76F5708f00a9BEA9c9FB6E0a75f",
        ZapInScriptExecutor: "0xd27AD781A31c02A6CC72e5A3f266C67Ea21A265D",
        ZapOutScriptExecutor: "0x876CDE52C84c11ac8d8C1729B7677E4D4016423A",
        BeefyScriptExecutor: "0xd40e302c60b160A31e6Dca657136caE25fCA7BC0"
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
