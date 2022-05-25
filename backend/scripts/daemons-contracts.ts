import { Contract } from "ethers";
import { ethers } from "hardhat";

export type DaemonsContracts = { [contractName: string]: string };
export const contracts: { [chainId: number]: DaemonsContracts } = {
    // Rinkeby
    4: {
        UniswapV2Router: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
        AavePriceOracle: "0xA323726989db5708B19EAd4A494dDe09F3cEcc69",
        PriceRetriever: "0x8B9e2137382191ad1C680B7cb7c87b8eEB7A8cae",
        DaemonsToken: "0x9dc85a8b22bCF95A669485830C8EFaF109AAB30c",
        GasTank: "0xa52CE7d38E7508aE0a3141e131865586373D7Afd",
        Treasury: "0xBbE0c880e267ccAAaCA194c04263D2b571AB19f0",
        Vesting: "0x8D1d9b3E33f24bAF8037675a143ec81B57F7b5F9",
        GasPriceFeed: "0x1f8b080138f9234c922f333F21Eb52130E15e7A1",
        SwapperScriptExecutor: "0x841e9c57FfC6A0246D12C4754Ce121DB9AdF3801",
        TransferScriptExecutor: "0x657b49614B56A026C0a5E436341cDDC98771480C",
        MmBaseScriptExecutor: "0xD1C6f87402fB8a494162263D42389db8E89a2876",
        MmAdvancedScriptExecutor: "0x74A2a783E0F4fE0B57144A053ecDd02cF5ba9929"
    },
    // Kovan
    42: {
        UniswapV2Router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        AavePriceOracle: "0xb8be51e6563bb312cbb2aa26e352516c25c26ac1",
        PriceRetriever: "0x6f105c09115673B3225A6928d461Cf9F15950b29",
        DaemonsToken: "0xfE74d8de9Bb3d36EEeBe31b9FC0ca5a97aB97803",
        GasTank: "0x06539bB59e1AF1923dB53d37e3ffA99133e0253c",
        Treasury: "0x3EF5244088D933F8a1975881A48E2777A9dB1e98",
        Vesting: "0x28cdCB675D314a8002e7D58ef11871885E77C1ac",
        GasPriceFeed: "0x86Cac325445891f1D37EE5000eaA2d11eb04EA1D",
        SwapperScriptExecutor: "0xAA7A64FF3038E109b00D4978986EA206A3f28454",
        TransferScriptExecutor: "0x3EB16b38DfE7725e699e0A76Cf668a690ca0C34C",
        MmBaseScriptExecutor: "0xaAFEc93916351D3Bf840FB6E8a9cdc7CE475aC07",
        MmAdvancedScriptExecutor: "0x942BB6D5e2fe14C89bCCce898fC42a59bc882E04"
    },
    // Fantom Testnet
    4002: {
        UniswapV2Router: "0xa6AD18C2aC47803E193F75c3677b14BF19B94883",
        AavePriceOracle: "0xA840C768f7143495790eC8dc2D5f32B71B6Dc113", //NOT 100% SURE!
        PriceRetriever: "0x8F934b2c8c2f6b496B54B3c7EF13D044f3543061",
        DaemonsToken: "0x4F234c9Ef3498633b140B6c6380F24d6Cc61218a",
        GasTank: "0xCEd7Db876508fBCd96F28D5f94ee2Ef6d73b8EeD",
        Treasury: "0xA4B7f58aB1B7f1E663a335f5ca76f24198a037E2",
        Vesting: "0xD25F813D90B6A7f54Fae4219a3ce4F06c4e0f4f5",
        GasPriceFeed: "0x44345BCd8FF2f858134e84b25D5ee18f6d28358B",
        SwapperScriptExecutor: "0x510Ec3cD4841D45C75a5b057e6A21e8436ded1B5",
        TransferScriptExecutor: "0x71cF2EE9EE783DF86351Db881a5e2Da0bC3BE6Cd",
        MmBaseScriptExecutor: "0x2F53c5273Df8736086c2F2a86e2A6a0fB9468ab3",
        MmAdvancedScriptExecutor: "0x1bCb155E9A09a3F5b14548661D1fb33bdf276A30"
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
