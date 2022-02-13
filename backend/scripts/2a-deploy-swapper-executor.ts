// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from 'ethers';
import { ethers } from "hardhat";

const testRouterAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
const gasTankAddress = '0x0D2a5C35ad867E6FBeaDD58977FD0ee42Fbb78aD';
const priceRetrieverAddress = '0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136';

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
  await swapperScriptExecutor.setExchange(testRouterAddress);
  console.log(`Secondary contracts have been set`);

  // set give executor permissions to access the gas tank methods
  const gasTank = await ethers.getContractAt("GasTank", gasTankAddress);
  await gasTank.addExecutor(swapperScriptExecutor.address);

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
