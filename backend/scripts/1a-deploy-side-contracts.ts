import { BigNumber } from 'ethers';
import { ethers } from "hardhat";

// KOVAN
// const testRouterAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';

// FTM TESTNET
const testRouterAddress = '0xa6AD18C2aC47803E193F75c3677b14BF19B94883';


const oneMonth = () => 60 * 60 * 24 * 30;
const now = () => Math.floor(new Date().getTime() / 1000);

// vesting starts one month from today
const vestingStart = () => now() + oneMonth();

// vesting lasts 2 years
const vestingDuration = () => oneMonth() * 24;

async function main() {
  const [owner] = await ethers.getSigners();
  const initialBalance = await owner.getBalance();
  console.log("Deploying contracts with the account:", owner.address);
  console.log("Account balance:", initialBalance.div(BigNumber.from("10").pow(BigNumber.from("12"))).toNumber() / 1000000);

  // deploy DAEM contract
  const TokenContract = await ethers.getContractFactory("DaemonsToken");
  const token = await TokenContract.deploy();
  await token.deployed();
  console.log(`DaemonsToken deployed to: ${token.address}`);

  // deploy GasTank contract
  const GasTankContract = await ethers.getContractFactory("GasTank");
  const gasTank = await GasTankContract.deploy();
  await gasTank.deployed();
  console.log(`GasTank deployed to: ${gasTank.address}`);

  // deploy Treasury contract
  const TreasuryContract = await ethers.getContractFactory("Treasury");
  const treasury = await TreasuryContract.deploy(token.address, gasTank.address, testRouterAddress);
  await treasury.deployed();
  console.log(`Treasury deployed to: ${treasury.address}`);

  // deploy Vesting contract
  const VestingContract = await ethers.getContractFactory("Vesting");
  const vesting = await VestingContract.deploy(token.address, vestingStart(), vestingDuration());
  await vesting.deployed();
  console.log(`Vesting deployed to: ${vesting.address}`);

  // deploy GasPriceFeed contract
  const GasPriceFeedContract = await ethers.getContractFactory("GasPriceFeed");
  const gasPriceFeed = await GasPriceFeedContract.deploy();
  await gasPriceFeed.deployed();
  console.log(`GasPriceFeed deployed to: ${gasPriceFeed.address}`);

  await gasTank.setTreasury(treasury.address);
  await token.initialize(treasury.address, vesting.address);

  // final checks
  await gasTank.preliminaryCheck();
  await treasury.preliminaryCheck();

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
