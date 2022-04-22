import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("Mock Aave Price Oracle", function () {
  let mockOracle: Contract;
  const fakePrice = ethers.utils.parseEther("0.02");

  this.beforeEach(async () => {
    // instantiate Mock oracle contracts
    const MockOracleContract = await ethers.getContractFactory("MockPriceOracleGetter");
    mockOracle = await MockOracleContract.deploy(fakePrice);
  });

  it('when asked for the price, returns the one passed in the constructor', async () => {
    const tokenAddress = '0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf';
    expect(await mockOracle.getAssetPrice(tokenAddress)).to.equal(fakePrice);
  });
});
