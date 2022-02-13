import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';

describe("BRG Token", function () {

  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let vesting: SignerWithAddress;
  let otherUser: SignerWithAddress;
  let BRG: Contract;

  this.beforeEach(async () => {
    // get some wallets
    [owner, treasury, vesting, otherUser] = await ethers.getSigners();

    // instantiate BAL token contract
    const BalrogTokenContract = await ethers.getContractFactory("BalrogToken");
    BRG = await BalrogTokenContract.deploy();
  });

  it('has the right attributes', async () => {
    expect(await BRG.symbol()).to.equal("BRG");
    expect(await BRG.name()).to.equal("Balrog");
    expect(await BRG.owner()).to.equal(owner.address);
  });

  it("Total and Circulating supply are 0 before initialization", async function () {
    expect(await BRG.totalSupply()).to.equal(BigNumber.from(0));
    expect(await BRG.circulatingSupply()).to.equal(BigNumber.from(0));
  });

  it("mints with the specified proportions when initialized", async function () {
    await BRG.initialize(treasury.address, vesting.address);

    // treasury has 75% of the whole supply
    expect(await BRG.balanceOf(treasury.address)).to.equal(ethers.utils.parseEther("750000000"));

    // owner has 25% of the whole supply
    expect(await BRG.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("250000000"));
  });

  it("Total supply takes into account all tokens as they are immediately minted", async function () {
    await BRG.initialize(treasury.address, vesting.address);
    expect(await BRG.totalSupply()).to.equal(await BRG.MAX_SUPPLY());
  });

  it("Circulating supply does not include the tokens in the treasury nor vesting contract", async function () {
    const aQuarterOfTheTotal = ethers.utils.parseEther("250000000");
    await BRG.initialize(treasury.address, vesting.address);

    // initially the circulating supply is 250M as the owner has it in their wallet
    expect(await BRG.circulatingSupply()).to.equal(aQuarterOfTheTotal);

    // after having sent it to the vesting contract, it will not be counted anymore
    await BRG.connect(owner).transfer(vesting.address, aQuarterOfTheTotal);
    expect(await BRG.balanceOf(vesting.address)).to.equal(aQuarterOfTheTotal);
    expect(await BRG.circulatingSupply()).to.equal(BigNumber.from(0));
  });


  it("can only be initialized once", async function () {
    await BRG.initialize(treasury.address, vesting.address);
    await expect(BRG.initialize(treasury.address, vesting.address))
      .to.be.revertedWith('Can only initialize once');
  });
});
