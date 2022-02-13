// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from 'ethers';
import { ethers } from "hardhat";

const gasTankAddress = '0x0D2a5C35ad867E6FBeaDD58977FD0ee42Fbb78aD';
const priceRetrieverAddress = '0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136';

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
  console.log(`Secondary contracts have been set`);

  // set give executor permissions to access the gas tank methods
  const gasTank = await ethers.getContractAt("GasTank", gasTankAddress);
  await gasTank.addExecutor(transferScriptExecutor.address);

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
