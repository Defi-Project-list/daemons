import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DaemonsContracts, getContract, getContractAddress, updateContracts } from "../daemons-contracts";

export const createLP = async (
    contracts: DaemonsContracts,
    amountETH: BigNumber,
    amountDAEM: BigNumber
): Promise<DaemonsContracts> => {
    const treasury = await getContract(contracts, "Treasury");

    console.log("Creating LP");
    let tx = await treasury.createLP(amountDAEM, { value: amountETH });
    await tx.wait();
    console.log(`LP created`);

    console.log(`Checking treasury`);
    await treasury.preliminaryCheck();
    console.log(`Treasury can operate`);

    console.log(`Retrieving LP address`);
    const router = await getContract(contracts, "UniswapV2Router");
    const tokenAddress = getContractAddress(contracts, "DaemonsToken");
    const WETHAddress = await router.WETH();

    const factoryAddress = await router.factory();
    const factoryContract = await ethers.getContractAt("IUniswapV2Factory", factoryAddress)
    const LPaddress = factoryContract.getPair(WETHAddress, tokenAddress);
    return updateContracts(contracts, "wethDaemLp", LPaddress);
};
