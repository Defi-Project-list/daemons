import { BigNumber } from 'ethers';
import { ethers } from "hardhat";
import { string } from 'hardhat/internal/core/params/argumentTypes';

const tokenAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
const vestingAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';

interface IBeneficiary {
  address: string;
  amount: BigNumber;
}

const beneficiaries: IBeneficiary[] = [
  {
    address: '0x000000000000000000000000000000000000dead',
    amount: ethers.utils.parseEther("125000000"),
  },
  {
    address: '0x00000000000000000000000000000000deaddead',
    amount: ethers.utils.parseEther("125000000"),
  },
];

async function main() {
  const [owner] = await ethers.getSigners();
  const initialBalance = await owner.getBalance();
  console.log("Deploying contracts with the account:", owner.address);
  console.log("Account balance:", initialBalance.div(BigNumber.from("10").pow(BigNumber.from("12"))).toNumber() / 1000000);

  // retrieve contract
  const token = await ethers.getContractAt("BalrogToken", tokenAddress);
  const vesting = await ethers.getContractAt("Vesting", vestingAddress);
  console.log(`Contracts retrieved`);

  // run some checks
  const ownerBalance = await token.balanceOf(owner.address);
  let totalAmountForBeneficiaries = BigNumber.from(0);
  beneficiaries.forEach(b => { totalAmountForBeneficiaries = totalAmountForBeneficiaries.add(b.amount); });

  if (ownerBalance.gt(totalAmountForBeneficiaries)) {
    throw new Error("Not all the owner balance seems to be distributed");
  }
  if (ownerBalance.lt(totalAmountForBeneficiaries)) {
    throw new Error("Distribution amount is higher than owner balance");
  }
  console.log(`Checks passed`);

  // transfer total amount to vesting contract
  await token.transfer(vesting.address, ownerBalance);
  console.log(`${ownerBalance.toString()} tokens have been sent to the vesting contract`);

  // set vesting terms for beneficiaries
  for (const beneficiary of beneficiaries) {
    await vesting.addBeneficiary(beneficiary.address, beneficiary.amount);
    console.log(`Beneficiary ${beneficiary.address} got assigned ${beneficiary.amount.toString()} tokens`);
  }

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
