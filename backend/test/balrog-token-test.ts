import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe("BAL Token", function () {

  let owner: SignerWithAddress;
  let otherUser: SignerWithAddress;
  let BRG: Contract;

  this.beforeEach(async () => {
    // get some wallets
    [owner, otherUser] = await ethers.getSigners();

    // instantiate BAL token contract
    const BalrogTokenContract = await ethers.getContractFactory("BalrogToken");
    BRG = await BalrogTokenContract.deploy();
  });

  it('has the right attributes', async () => {
    expect(await BRG.symbol()).to.equal("BRG");
    expect(await BRG.name()).to.equal("Balrog");
    expect(await BRG.owner()).to.equal(owner.address);
  });

  it("can be minted into external wallets", async function () {
    await BRG.mint(owner.address, 150000);
    await BRG.mint(otherUser.address, 200000);

    expect(await BRG.balanceOf(owner.address)).to.equal(150000);
    expect(await BRG.balanceOf(otherUser.address)).to.equal(200000);
    expect(await BRG.totalSupply()).to.equal(350000);
  });

  it('fails a transfer if the balance is too low', async function () {
    await expect(BRG.transfer(otherUser.address, 750)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it('transfer is successful if balance is high enough', async function () {
    await BRG.mint(owner.address, 150000);
    await BRG.transfer(otherUser.address, 750);

    expect(await BRG.balanceOf(owner.address)).to.equal(150000 - 750);
    expect(await BRG.balanceOf(otherUser.address)).to.equal(750);
  });

  it('can be burned', async function () {
    await BRG.mint(owner.address, 150000);
    await BRG.burn(149900);

    expect(await BRG.balanceOf(owner.address)).to.equal(100);
    expect(await BRG.totalSupply()).to.equal(100);
  });
});
