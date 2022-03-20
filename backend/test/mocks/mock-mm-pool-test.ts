import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe("Mock Money Market Pool", function () {

    let owner: SignerWithAddress;
    let otherUser: SignerWithAddress;
    let fooToken: Contract;
    let aFooToken: Contract;
    let mockMoneyMarketPool: Contract;

    this.beforeEach(async () => {
        // get some wallets
        [owner, otherUser] = await ethers.getSigners();

        // instantiate Mock token contracts
        const MockTokenContract = await ethers.getContractFactory("MockToken");
        fooToken = await MockTokenContract.deploy("Foo", "FOO");
        aFooToken = await MockTokenContract.deploy("aFoo", "aFOO");

        // instantiate Mock MMPool contract
        const MockMoneyMarketPoolContract = await ethers.getContractFactory("MockMoneyMarketPool");
        mockMoneyMarketPool = await MockMoneyMarketPoolContract.deploy(fooToken.address, aFooToken.address);
    });

    it('mocks supply function', async () => {
        await fooToken.mint(owner.address, 150000);
        await fooToken.approve(mockMoneyMarketPool.address, ethers.utils.parseEther("500"));

        await mockMoneyMarketPool.supply(fooToken.address, 100000, otherUser.address, 0);

        // 100000 tokens should have been taken from owner
        expect((await fooToken.balanceOf(owner.address)).toNumber()).to.be.equal(50000);
        // and 100000 aTokens should have been given to otherUser
        expect((await aFooToken.balanceOf(otherUser.address)).toNumber()).to.be.equal(100000);
    });

    it('mocks withdraw function', async () => {
        await aFooToken.mint(owner.address, 150000);
        await aFooToken.approve(mockMoneyMarketPool.address, ethers.utils.parseEther("500"));

        await mockMoneyMarketPool.withdraw(fooToken.address, 100000, otherUser.address);

        // 100000 aTokens should have been taken from owner
        expect((await aFooToken.balanceOf(owner.address)).toNumber()).to.be.equal(50000);
        // and 100000 tokens should have been given to otherUser
        expect((await fooToken.balanceOf(otherUser.address)).toNumber()).to.be.equal(100000);
    });

    it('mocks borrow function', async () => {
        await mockMoneyMarketPool.borrow(fooToken.address, 100000, 0, 0, otherUser.address);

        // 100000 tokens should have been given to **OWNER**
        expect((await fooToken.balanceOf(owner.address)).toNumber()).to.be.equal(100000);
    });

    it('mocks repay function', async () => {
        await fooToken.mint(owner.address, 150000);
        await fooToken.approve(mockMoneyMarketPool.address, ethers.utils.parseEther("500"));

        await mockMoneyMarketPool.repay(fooToken.address, 100000, 0, otherUser.address);

        // 100000 tokens should have been taken from owner
        expect((await fooToken.balanceOf(owner.address)).toNumber()).to.be.equal(50000);
    });
});
