import { BaseProvider } from '@ethersproject/providers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe("GasTank", function () {

    let provider: BaseProvider;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let gasTank: Contract;
    let treasury: Contract;
    let fooToken: Contract;

    this.beforeEach(async () => {
        // get the default provider
        provider = ethers.provider;

        // get some wallets
        [owner, user1, user2] = await ethers.getSigners();

        // Token contracts
        const FooTokenContract = await ethers.getContractFactory("MockToken");
        fooToken = await FooTokenContract.deploy("Foo Token", "FOO");

        // GasTank contract
        const GasTankContract = await ethers.getContractFactory("GasTank");
        gasTank = await GasTankContract.deploy();

        // Treasury contract
        const TreasuryContract = await ethers.getContractFactory("Treasury");
        treasury = await TreasuryContract.deploy(fooToken.address, gasTank.address);

        // add some tokens to treasury
        fooToken.mint(treasury.address, ethers.utils.parseEther("100"));

        // set treasury address in gas tank
        await gasTank.setTreasury(treasury.address);

        // sets owner as executor
        await gasTank.addExecutor(owner.address);
    });

    describe("Withdrawals and Deposits", function () {
        it("accepts deposits and shows correct balance", async () => {
            // deposit 1 eth into the gas tank
            const oneEth = ethers.utils.parseEther("1.0");
            await gasTank.deposit({ value: oneEth });

            // the user balance in the gas tank should be 1 eth
            const userBalanceInTank = await gasTank.balanceOf(owner.address);
            expect(userBalanceInTank).to.equal(oneEth);

            // the total balance of the gas tank should also be 1 eth
            const tankTotalBalance = await provider.getBalance(gasTank.address);
            expect(tankTotalBalance).to.equal(oneEth);
        });

        it("allows users to withdraw funds", async () => {
            const oneEth = ethers.utils.parseEther("1.0");
            await gasTank.deposit({ value: oneEth });

            const oThreeEth = ethers.utils.parseEther("0.3");
            await gasTank.withdraw(oThreeEth);

            // the user balance should have been updated
            const userBalanceInTank = await gasTank.balanceOf(owner.address);
            expect(userBalanceInTank).to.equal(ethers.utils.parseEther("0.7"));

            // same for the total balance of the tank
            const tankTotalBalance = await provider.getBalance(gasTank.address);
            expect(tankTotalBalance).to.equal(ethers.utils.parseEther("0.7"));
        });

        it("allows users to withdraw everything", async () => {
            const oneEth = ethers.utils.parseEther("1.0");
            await gasTank.deposit({ value: oneEth });

            await gasTank.withdrawAll();

            // the user balance should have been updated
            const userBalanceInTank = await gasTank.balanceOf(owner.address);
            expect(userBalanceInTank).to.equal(ethers.utils.parseEther("0"));

            // same for the total balance of the tank
            const tankTotalBalance = await provider.getBalance(gasTank.address);
            expect(tankTotalBalance).to.equal(ethers.utils.parseEther("0"));
        });
    });

    describe("Rewards and Claims", function () {

        it("allows executors to add rewards", async () => {
            // USER1 deposits 1 eth into the gas tank
            const oneEth = ethers.utils.parseEther("1.0");
            await gasTank.connect(user1).deposit({ value: oneEth });

            // the user balance in the gas tank should be 1 eth
            const userBalanceInTank = await gasTank.balanceOf(user1.address);
            expect(userBalanceInTank).to.equal(oneEth);

            // owner (impersonating the executor contract) adds a reward for user2
            const rewardAmount = ethers.utils.parseEther("0.05");
            await gasTank.connect(owner).addReward(rewardAmount, user1.address, user2.address);

            // balances should have been updated
            expect(await gasTank.claimable(user2.address)).to.equal(rewardAmount);
            expect(await gasTank.balanceOf(user1.address)).to.equal(oneEth.sub(rewardAmount));
        });

        it("revert if non executors try to add a reward", async () => {
            // remove executor so it'll revert the tx
            await gasTank.removeExecutor(owner.address);

            const oneEth = ethers.utils.parseEther("1.0");
            const rewardAmount = ethers.utils.parseEther("0.05");
            await gasTank.connect(user1).deposit({ value: oneEth });

            // this will revert as owner is not marked as executor anymore
            await expect(gasTank.connect(owner).addReward(rewardAmount, user1.address, user2.address))
                .to.be.revertedWith('Unauthorized. Only Executors');
        });

        it("when claiming reward, ETH will be sent to treasury", async () => {
            // user 1: 0.95ETH as balance, user 2: 0.05ETH as claimable
            const oneEth = ethers.utils.parseEther("1.0");
            const rewardAmount = ethers.utils.parseEther("0.05");
            await gasTank.connect(user1).deposit({ value: oneEth });
            await gasTank.connect(owner).addReward(rewardAmount, user1.address, user2.address);

            // user 2 claim their reward
            await gasTank.connect(user2).claimReward();

            // treasury received the funds
            const treasuryTotalBalance = await provider.getBalance(treasury.address);
            expect(treasuryTotalBalance).to.equal(rewardAmount);

            // claimable amount is now 0
            expect((await gasTank.claimable(user2.address)).toNumber()).to.equal(0);

            // user2 received some tokens
            const expectedReward = rewardAmount;
            expect(await fooToken.balanceOf(user2.address)).to.equal(expectedReward);
        });
    });


});
