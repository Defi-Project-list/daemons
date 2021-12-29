// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", owner.address);
  console.log("Account balance:", (await owner.getBalance()).toString());

  const BalrogTokenContract = await ethers.getContractFactory("BalrogToken");
  const balrogToken = await BalrogTokenContract.deploy();

  const GasTankContract = await ethers.getContractFactory("GasTank");
  const gasTank = await GasTankContract.deploy();

  await balrogToken.deployed();
  console.log("BRG Token deployed to:", balrogToken.address);

  await gasTank.deployed();
  console.log("GasTank deployed to:", gasTank.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
