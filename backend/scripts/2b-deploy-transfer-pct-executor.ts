// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from 'ethers';
import { ethers } from "hardhat";

const gasTankAddress = '0x7824B232DEF6d1d8a3D381ba50eF681EE0f46Ec7';
const priceRetrieverAddress = '0xf94EA781F213b1782f89a2F451D45BC6DD896bE7';
const gasPriceFeedAddress = '0x2C28B423c9ECbB63DdF5cbaa9AbF1C4835c7285E';

async function main() {
  const [owner] = await ethers.getSigners();
  const initialBalance = await owner.getBalance();
  console.log("Deploying contracts with the account:", owner.address);
  console.log("Account balance:", initialBalance.div(BigNumber.from("10").pow(BigNumber.from("12"))).toNumber() / 1000000);

  // Transfer Script Executor
  const transferScriptExecutorContract = await ethers.getContractFactory("TransferPctScriptExecutor");
  const transferPctScriptExecutor = await transferScriptExecutorContract.deploy();
  await transferPctScriptExecutor.deployed();
  console.log(`TransferPctScriptExecutor deployed to: ${transferPctScriptExecutor.address}`);

  await transferPctScriptExecutor.setGasTank(gasTankAddress);
  await transferPctScriptExecutor.setPriceRetriever(priceRetrieverAddress);
  await transferPctScriptExecutor.setGasFeed(gasPriceFeedAddress);
  console.log(`Secondary contracts have been set`);

  // set give executor permissions to access the gas tank methods
  const gasTank = await ethers.getContractAt("GasTank", gasTankAddress);
  await gasTank.addExecutor(transferPctScriptExecutor.address);

  // final checks
  await transferPctScriptExecutor.preliminaryCheck();

  const finalBalance = await owner.getBalance();
  console.log("Deployment completed");
  console.log("ETH spent in gas fees: ", initialBalance.sub(finalBalance).div(BigNumber.from("10").pow(BigNumber.from("12"))).toNumber() / 1000000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
