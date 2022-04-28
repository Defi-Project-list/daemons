// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from 'ethers';
import { ethers } from "hardhat";

const gasTankAddress = '0x29A74Bab786C01E3181191a77Dfd5A590f2a47e1';
const priceRetrieverAddress = '0xf94EA781F213b1782f89a2F451D45BC6DD896bE7';
const gasPriceFeedAddress = '0x69c05f9E5f370546c41CDa2bA2C7f439f2460a32';

async function main() {
  const [owner] = await ethers.getSigners();
  const initialBalance = await owner.getBalance();
  console.log("Deploying contracts with the account:", owner.address);
  console.log("Account balance:", initialBalance.div(BigNumber.from("10").pow(BigNumber.from("12"))).toNumber() / 1000000);

  // Swapper Script Executor
  const swapperScriptExecutorContract = await ethers.getContractFactory("SwapperScriptExecutor");
  const swapperScriptExecutor = await swapperScriptExecutorContract.deploy();
  await swapperScriptExecutor.deployed();
  console.log(`SwapperScriptExecutor deployed to: ${swapperScriptExecutor.address}`);

  await swapperScriptExecutor.setGasTank(gasTankAddress);
  await swapperScriptExecutor.setPriceRetriever(priceRetrieverAddress);
  await swapperScriptExecutor.setGasFeed(gasPriceFeedAddress);
  console.log(`Secondary contracts have been set`);

  // set give executor permissions to access the gas tank methods
  const gasTank = await ethers.getContractAt("GasTank", gasTankAddress);
  await gasTank.addExecutor(swapperScriptExecutor.address);
  console.log(`Given access to GasTank`);

  // final checks
  await swapperScriptExecutor.preliminaryCheck();

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
