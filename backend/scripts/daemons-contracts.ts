import { Contract } from "ethers";
import { ethers } from "hardhat";

export type DaemonsContracts = { [contractName: string]: string };
export const contracts: { [chainId: number]: DaemonsContracts } = {
    // Rinkeby
    4: {
        UniswapV2Router: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
        AavePriceOracle: "0xA323726989db5708B19EAd4A494dDe09F3cEcc69",
        PriceRetriever: "0xf679088D6f27A7F8F28e1A4642461FB65337704D",
        DaemonsToken: "0x7bF06253416bE429414d62C60cc413d2bFfdE8FC",
        GasTank: "0x51d04DbB19C4133D1c573992296D71Dc01e35aD7",
        Treasury: "0xCfa3852Dad56211B3Cbf6270b720AD8367F87bD5",
        Vesting: "0x66362A507bbA0eBEc4E4A61d0bC82D77B35238d0",
        GasPriceFeed: "0x419CF7c2a9B0F60C5C84aBD6F2FBDCF177dEdcCC",
        SwapperScriptExecutor: "0x570c1a344BBEEB685b8C14D3B0a59Da3D967931E",
        TransferScriptExecutor: "0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136",
        MmBaseScriptExecutor: "0x09c89F158A3fF7A2A3c3DcCdF77E8D8761946684",
        MmAdvancedScriptExecutor: "0xAB3B0A5631E10786a19F950FD73af7b6724111AA"
    },
    // Kovan
    42: {
        UniswapV2Router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        AavePriceOracle: "0xb8be51e6563bb312cbb2aa26e352516c25c26ac1"
    },
    // Fantom Testnet
    4002: {
        UniswapV2Router: "0xa6AD18C2aC47803E193F75c3677b14BF19B94883",
        AavePriceOracle: "0xA840C768f7143495790eC8dc2D5f32B71B6Dc113" //NOT 100% SURE!
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
