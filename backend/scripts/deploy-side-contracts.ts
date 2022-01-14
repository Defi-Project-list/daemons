// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber, Contract } from 'ethers';
import { ethers } from "hardhat";

const testRouterAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';

async function main() {
  const [owner] = await ethers.getSigners();
  const initialBalance = await owner.getBalance();
  console.log("Deploying contracts with the account:", owner.address);
  console.log("Account balance:", initialBalance.div(BigNumber.from("10").pow(BigNumber.from("12"))).toNumber() / 1000000);

  // deploy side contracts
  await deploySimpleContract("BalrogToken");
  await deploySimpleContract("GasTank");

  const finalBalance = await owner.getBalance();
  console.log("Deployment completed");
  console.log("ETH spent in gas fees: ", initialBalance.sub(finalBalance).div(BigNumber.from("10").pow(BigNumber.from("12"))).toNumber() / 1000000);
}

async function deploySimpleContract(contractName: string): Promise<Contract> {
  const contract = await ethers.getContractFactory(contractName);
  const deployedContract = await contract.deploy();

  await deployedContract.deployed();
  console.log(`${contractName} deployed to: ${deployedContract.address}`);

  return deployedContract;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
