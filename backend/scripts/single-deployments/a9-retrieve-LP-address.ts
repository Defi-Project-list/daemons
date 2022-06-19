import { ethers } from "hardhat";
import {
    DaemonsContracts,
    getContract,
    getContractAddress,
    updateContracts
} from "../daemons-contracts";

export const retrieveLPAddress = async (contracts: DaemonsContracts): Promise<DaemonsContracts> => {
    console.log(`Retrieving LP address`);
    const router = await getContract(contracts, "IUniswapV2Router01");
    const tokenAddress = getContractAddress(contracts, "DaemonsToken");
    const WETHAddress = await router.WETH();

    const factoryAddress = await router.factory();
    const factoryContract = await ethers.getContractAt("IUniswapV2Factory", factoryAddress);
    const LPaddress = await factoryContract.getPair(WETHAddress, tokenAddress);
    return updateContracts(contracts, "wethDaemLp", LPaddress);
};
