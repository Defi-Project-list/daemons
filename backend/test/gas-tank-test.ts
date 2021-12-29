import { BaseProvider } from '@ethersproject/providers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe("GasTank", function () {

    let provider: BaseProvider;
    let owner: SignerWithAddress;
    let gasTank: Contract;

    this.beforeEach(async () => {
        // get the default provider
        provider = ethers.provider;

        // get some wallets
        [owner] = await ethers.getSigners();

        // GasTank contract
        const GasTankContract = await ethers.getContractFactory("GasTank");
        gasTank = await GasTankContract.deploy();
    });

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
