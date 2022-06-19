import { ethers } from "hardhat";
import { DaemonsContracts, getContractAddress, updateContracts } from "../daemons-contracts";

export const deployTreasury = async (contracts: DaemonsContracts): Promise<DaemonsContracts> => {
    console.log("Deploying Treasury");

    const routerAddress = getContractAddress(contracts, "IUniswapV2Router01");
    const tokenAddress = getContractAddress(contracts, "DaemonsToken");
    const gasTankAddress = getContractAddress(contracts, "GasTank");
    const TreasuryContract = await ethers.getContractFactory("Treasury");
    const treasury = await TreasuryContract.deploy(tokenAddress, gasTankAddress, routerAddress);
    await treasury.deployed();

    console.log(`Treasury deployed`);
    return updateContracts(contracts, "Treasury", treasury.address);
};
