import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe("Mock Router", function () {

    let owner: SignerWithAddress;
    let otherUser: SignerWithAddress;
    let fooToken: Contract;
    let barToken: Contract;
    let mockRouter: Contract;

    this.beforeEach(async () => {
        // get some wallets
        [owner, otherUser] = await ethers.getSigners();

        // instantiate Mock token contracts
        const MockTokenContract = await ethers.getContractFactory("MockToken");
        fooToken = await MockTokenContract.deploy("Foo Token", "FOO");
        barToken = await MockTokenContract.deploy("Bar Token", "BAR");

        // instantiate Mock router contract
        const MockRouterContract = await ethers.getContractFactory("MockRouter");
        mockRouter = await MockRouterContract.deploy();
    });

    it('correctly swaps tokens', async () => {
        await fooToken.mint(owner.address, 150000);

        expect(await fooToken.balanceOf(owner.address)).to.equal(150000);
        expect(await barToken.balanceOf(owner.address)).to.equal(0);

        await mockRouter.swapExactTokensForTokens(150000, 0, [fooToken.address, barToken.address], owner.address, 0);

        expect(await fooToken.balanceOf(owner.address)).to.equal(0);
        expect(await barToken.balanceOf(owner.address)).to.equal(150000);
    });
});
