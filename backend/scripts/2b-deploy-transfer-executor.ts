// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from 'ethers';
import { ethers } from "hardhat";

// KOVAN
// const gasTankAddress = '0x29A74Bab786C01E3181191a77Dfd5A590f2a47e1';
// const priceRetrieverAddress = '0xf94EA781F213b1782f89a2F451D45BC6DD896bE7';
// const gasPriceFeedAddress = '0x69c05f9E5f370546c41CDa2bA2C7f439f2460a32';

// FTM TESTNET
const gasTankAddress = '0x7aa32870031c7F908618C31844220e28437398A0';
const priceRetrieverAddress = '0x46F388505b6ba78C5732346653F96a206A738d2B';
const gasPriceFeedAddress = '0x7C5559A8e28dea123795e61FCc3cFbE0B1E9AfaF';

async function main() {
  const [owner] = await ethers.getSigners();
  const initialBalance = await owner.getBalance();
  console.log("Deploying contracts with the account:", owner.address);
  console.log("Account balance:", initialBalance.div(BigNumber.from("10").pow(BigNumber.from("12"))).toNumber() / 1000000);

  // Transfer Script Executor
  const transferScriptExecutorContract = await ethers.getContractFactory("TransferScriptExecutor");
  const transferScriptExecutor = await transferScriptExecutorContract.deploy();
  await transferScriptExecutor.deployed();
  console.log(`TransferScriptExecutor deployed to: ${transferScriptExecutor.address}`);

  await transferScriptExecutor.setGasTank(gasTankAddress);
  await transferScriptExecutor.setPriceRetriever(priceRetrieverAddress);
  await transferScriptExecutor.setGasFeed(gasPriceFeedAddress);
  console.log(`Secondary contracts have been set`);

  // set give executor permissions to access the gas tank methods
  const gasTank = await ethers.getContractAt("GasTank", gasTankAddress);
  await gasTank.addExecutor(transferScriptExecutor.address);
  console.log(`Given access to GasTank`);

  // final checks
  await transferScriptExecutor.preliminaryCheck();

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
