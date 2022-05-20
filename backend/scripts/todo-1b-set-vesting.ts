import { BigNumber } from 'ethers';
import { ethers } from "hardhat";

// KOVAN
// const tokenAddress = '0x19ff2C637621bEbe560f62b78cECc3C6970aC34b';
// const vestingAddress = '0x9b1A37768B442Ab14efb986655b1751FFdeC6Abd';

// FTM TESTNET
// const tokenAddress = '0xbe6216682D743e414b119Af0AFBA91687685F099';
// const vestingAddress = '0x9d9c77B481003Edf8Db7AE82403d51cF113fe253';

// RINKEBY
const tokenAddress = '0x4c1Ca0AaD17eaF83e6e5D474F827eCA16dab1D10';
const vestingAddress = '0xc64CfA137BA4eA946F16E0d299036D1E1B052F64';

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
  const token = await ethers.getContractAt("DaemonsToken", tokenAddress);
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