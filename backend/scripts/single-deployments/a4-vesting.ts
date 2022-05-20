import { ethers } from "hardhat";
import { DaemonsContracts, getContractAddress, updateContracts } from "../daemons-contracts";

export const deployVesting = async (
    contracts: DaemonsContracts,
): Promise<DaemonsContracts> => {
    console.log('Deploying Vesting');

    const oneMonth = () => 60 * 60 * 24 * 30;
    const now = () => Math.floor(new Date().getTime() / 1000);
    // vesting starts one month from today
    const vestingStart = () => now() + oneMonth();
    // vesting lasts 4 years
    const vestingDuration = () => oneMonth() * 48;

    const tokenAddress = getContractAddress(contracts, "DaemonsToken")
    const VestingContract = await ethers.getContractFactory("Vesting");
    const vesting = await VestingContract.deploy(tokenAddress, vestingStart(), vestingDuration());
    await vesting.deployed();

    console.log(`Vesting deployed`);
    return updateContracts(contracts, "Vesting", vesting.address);
}
