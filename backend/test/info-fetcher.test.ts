import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

describe("InfoFetcher", function () {
    let owner: SignerWithAddress;
    let DAEMToken: Contract;
    let fooToken: Contract;
    let barToken: Contract;
    let infoFetcher: Contract;
    let mmV2: Contract;
    let mmV3: Contract;

    this.beforeEach(async () => {
        [owner] = await ethers.getSigners();

        // deploy InfoFetcher
        const InfoFetcherContract = await ethers.getContractFactory("InfoFetcher");
        infoFetcher = await InfoFetcherContract.deploy();

        // Create some tokens
        const MockTokenContract = await ethers.getContractFactory("MockToken");
        DAEMToken = await MockTokenContract.deploy("Foo Token", "FOO");
        fooToken = await MockTokenContract.deploy("Foo Token", "FOO");
        barToken = await MockTokenContract.deploy("Bar Token", "BAR");

        // Mint some balance in the user wallet
        await DAEMToken.mint(owner.address, 125000);
        await fooToken.mint(owner.address, 758500);

        // Deploy Mock MMs
        const addr0 = ethers.constants.AddressZero;
        const MMV2Contract = await ethers.getContractFactory("MockReserveDataV2");
        mmV2 = await MMV2Contract.deploy(addr0, addr0, addr0);
        const MMV3Contract = await ethers.getContractFactory("MockReserveDataV3");
        mmV3 = await MMV3Contract.deploy(addr0, addr0, addr0);
    });

    it("Gets the right balances", async () => {
        const result = await infoFetcher.fetchTokenBalances(owner.address, [
            DAEMToken.address,
            fooToken.address,
            barToken.address
        ]);

        expect(result.length).to.equal(3);
        expect(result[0].toNumber()).to.equal(125000);
        expect(result[1].toNumber()).to.equal(758500);
        expect(result[2].toNumber()).to.equal(0);
    });

    it("Gets the MM information for V2", async () => {
        const tokens = [DAEMToken.address, fooToken.address, barToken.address];

        const result = await infoFetcher.fetchMmInfo(
            mmV2.address,
            false,
            owner.address,
            tokens,
            tokens
        );

        console.log(result);
        expect(result.length).to.equal(3);

        // "accountData" contains the fake data returned in "MockMoneyMarketPool"
        const accountData = result.accountData;
        expect(accountData.length).to.equal(6);
        expect(accountData.totalCollateralETH).to.equal(BigNumber.from("12000000000000000000"));
        expect(accountData.totalDebtETH).to.equal(BigNumber.from("10000000000000000000"));
        expect(accountData.availableBorrowsETH).to.equal(BigNumber.from("35000000000000000000"));
        expect(accountData.currentLiquidationThreshold).to.equal(BigNumber.from("555"));
        expect(accountData.ltv).to.equal(BigNumber.from("125"));
        expect(accountData.healthFactor).to.equal(BigNumber.from("2000000000000000000"));

        // "balances" simply contains the 3 tokens balances
        const balances = result.balances;
        expect(balances.length).to.equal(3);
        expect(balances[0].toNumber()).to.equal(125000);
        expect(balances[1].toNumber()).to.equal(758500);
        expect(balances[2].toNumber()).to.equal(0);

        // "APYs" contains 3 values for each token (123, 456, 789)
        const APYs = result.APYs;
        expect(APYs.length).to.equal(9);
        expect(APYs[0].toNumber()).to.equal(123);
        expect(APYs[1].toNumber()).to.equal(456);
        expect(APYs[2].toNumber()).to.equal(789);
        expect(APYs[3].toNumber()).to.equal(123);
        expect(APYs[4].toNumber()).to.equal(456);
        expect(APYs[5].toNumber()).to.equal(789);
        expect(APYs[6].toNumber()).to.equal(123);
        expect(APYs[7].toNumber()).to.equal(456);
        expect(APYs[8].toNumber()).to.equal(789);
    });

    it("Gets the MM information for V3", async () => {
        const tokens = [DAEMToken.address, fooToken.address, barToken.address];

        const result = await infoFetcher.fetchMmInfo(
            mmV3.address,
            true,
            owner.address,
            tokens,
            tokens
        );

        console.log(result);
        expect(result.length).to.equal(3);

        // "accountData" contains the fake data returned in "MockMoneyMarketPool"
        const accountData = result.accountData;
        expect(accountData.length).to.equal(6);
        expect(accountData.totalCollateralETH).to.equal(BigNumber.from("12000000000000000000"));
        expect(accountData.totalDebtETH).to.equal(BigNumber.from("10000000000000000000"));
        expect(accountData.availableBorrowsETH).to.equal(BigNumber.from("35000000000000000000"));
        expect(accountData.currentLiquidationThreshold).to.equal(BigNumber.from("555"));
        expect(accountData.ltv).to.equal(BigNumber.from("125"));
        expect(accountData.healthFactor).to.equal(BigNumber.from("2000000000000000000"));

        // "balances" simply contains the 3 tokens balances
        const balances = result.balances;
        expect(balances.length).to.equal(3);
        expect(balances[0].toNumber()).to.equal(125000);
        expect(balances[1].toNumber()).to.equal(758500);
        expect(balances[2].toNumber()).to.equal(0);

        // "APYs" contains 3 values for each token (123, 456, 789)
        const APYs = result.APYs;
        expect(APYs.length).to.equal(9);
        expect(APYs[0].toNumber()).to.equal(123);
        expect(APYs[1].toNumber()).to.equal(456);
        expect(APYs[2].toNumber()).to.equal(789);
        expect(APYs[3].toNumber()).to.equal(123);
        expect(APYs[4].toNumber()).to.equal(456);
        expect(APYs[5].toNumber()).to.equal(789);
        expect(APYs[6].toNumber()).to.equal(123);
        expect(APYs[7].toNumber()).to.equal(456);
        expect(APYs[8].toNumber()).to.equal(789);
    });
});
