// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber, Contract } from 'ethers';
import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const initialBalance = await owner.getBalance();
  console.log("Deploying contracts with the account:", owner.address);
  console.log("Account balance:", initialBalance.div(BigNumber.from("10").pow(BigNumber.from("12"))).toNumber() / 1000000);

  const priceRetriever = await deploySimpleContract("PriceRetriever");

  const btcUsdFeed = '0x6135b13325bfC4B00278B4abC5e20bbce2D6580e';
  const btcAddress = '0xd1b98b6607330172f1d991521145a22bce793277';
  const btcDecimals = 8;
  const btcFeedDecimals = 8;
  await priceRetriever.addPriceFeed(btcAddress, btcUsdFeed, btcDecimals, btcFeedDecimals);
  console.log("Added BTC price feed");

  const ethUsdFeed = '0x9326BFA02ADD2366b30bacB125260Af641031331';
  const ethAddress = '0xf3a6679b266899042276804930b3bfbaf807f15b';
  const ethDecimals = 18;
  const ethFeedDecimals = 8;
  await priceRetriever.addPriceFeed(ethAddress, ethUsdFeed, ethDecimals, ethFeedDecimals);
  console.log("Added ETH price feed");

  const uniUsdFeed = '0xDA5904BdBfB4EF12a3955aEcA103F51dc87c7C39';
  const uniAddress = '0x075a36ba8846c6b6f53644fdd3bf17e5151789dc';
  const uniDecimals = 18;
  const uniFeedDecimals = 8;
  await priceRetriever.addPriceFeed(uniAddress, uniUsdFeed, uniDecimals, uniFeedDecimals);
  console.log("Added UNI price feed");

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
