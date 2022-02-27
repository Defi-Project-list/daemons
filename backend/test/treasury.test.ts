import { BaseProvider } from '@ethersproject/providers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe("Treasury", function () {

    let provider: BaseProvider;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let gasTank: SignerWithAddress;
    let treasury: Contract;
    let fooToken: Contract;

    this.beforeEach(async () => {
        // get the default provider
        provider = ethers.provider;

        // get some wallets
        [owner, user1, gasTank] = await ethers.getSigners();

        // Token contracts
        const FooTokenContract = await ethers.getContractFactory("MockToken");
        fooToken = await FooTokenContract.deploy("Foo Token", "FOO");

        // Treasury contract
        const TreasuryContract = await ethers.getContractFactory("Treasury");
        treasury = await TreasuryContract.deploy(fooToken.address, gasTank.address);

        // add some tokens to treasury
        fooToken.mint(treasury.address, ethers.utils.parseEther("100"));

        // check that everything has been set correctly
        await treasury.preliminaryCheck();
    });

    it("can change commission percentage", async () => {
        // initially commission is set to 1%
        expect(await treasury.PERCENTAGE_COMMISSION()).to.equal(100);

        // owner can change it
        await treasury.setCommissionPercentage(50);
        expect(await treasury.PERCENTAGE_COMMISSION()).to.equal(50);

        // anyone else cannot
        await expect(treasury.connect(user1).setCommissionPercentage(150)).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it("throws an error if trying to set commission percentage outside bounds", async () => {
        // too high commission
        await expect(treasury.setCommissionPercentage(1500)).to.be.revertedWith('Commission must be at most 5%');
    });

    it("can change protocol owned liquidity (POL) percentage", async () => {
        // initially POL percentage is set to 49%
        expect(await treasury.PERCENTAGE_POL()).to.equal(4900);

        // owner can change it
        await treasury.setPolPercentage(3000);
        expect(await treasury.PERCENTAGE_POL()).to.equal(3000);

        // anyone else cannot
        await expect(treasury.connect(user1).setPolPercentage(2500)).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it("throws an error if trying to set POL percentage outside bounds", async () => {
        // too high pol percentage
        await expect(treasury.setPolPercentage(8000)).to.be.revertedWith('POL must be at most 50%');

        // too low pol percentage
        await expect(treasury.setPolPercentage(50)).to.be.revertedWith('POL must be at least 5%');
    });

    it("only gas tank can initialize payout request", async () => {
        const amount = ethers.utils.parseEther("1.0");
        await expect(treasury.requestPayout(user1.address, { value: amount })).to.be.revertedWith('Unauthorized. Only GasTank');
    });

    it("payout causes tokens to be sent to the user", async () => {
        const amount = ethers.utils.parseEther("1.0");
        await treasury.connect(gasTank).requestPayout(user1.address, { value: amount });

        // treasury got the eth and user got the tokens
        expect(await provider.getBalance(treasury.address)).to.equal(amount);
        expect(await fooToken.balanceOf(user1.address)).to.equal(amount);
    });

    it("payout causes ETH to be distributed into pools accordingly", async () => {
        const amount = ethers.utils.parseEther("1.0");
        await treasury.connect(gasTank).requestPayout(user1.address, { value: amount });

        // 1% commission, 49% POL, 50% redistribution
        expect(await treasury.commissionsPool()).to.equal(ethers.utils.parseEther("0.01"));
        expect(await treasury.polPool()).to.equal(ethers.utils.parseEther("0.49"));
        expect(await treasury.redistributionPool()).to.equal(ethers.utils.parseEther("0.50"));
    });

    it("owner can withdraw commission from the pool", async () => {
        const ownerInitialBalance = await provider.getBalance(owner.address);
        const amount = ethers.utils.parseEther("1.0");
        await treasury.connect(gasTank).requestPayout(user1.address, { value: amount });

        // anyone else will cause error
        await expect(treasury.connect(user1).claimCommission()).to.be.revertedWith('Ownable: caller is not the owner');
        expect(await treasury.commissionsPool()).to.equal(ethers.utils.parseEther("0.01"));

        // but owner can claim commission
        await treasury.connect(owner).claimCommission();

        // commission pool is emptied
        expect(await treasury.commissionsPool()).to.equal(ethers.utils.parseEther("0"));

        // ETH is in user wallet (as the user pays for gas,
        // we just check they have more than what they started with)
        const ownerFinalBalance = await provider.getBalance(owner.address);
        expect(ownerFinalBalance.gt(ownerInitialBalance)).to.be.true;
    });
});
