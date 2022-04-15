import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

describe("Price Retriever", function () {
  let owner: SignerWithAddress;
  let priceRetriever: Contract;

  this.beforeEach(async () => {
    // get owner
    [owner] = await ethers.getSigners();

    // instantiate Mock Price Retriever contracts
    const PriceRetrieverContract = await ethers.getContractFactory(
      "PriceRetriever"
    );
    priceRetriever = await PriceRetrieverContract.deploy();
  });

  it("allows adding a price feeds and retrieving data", async () => {
    const btcAddress = "0x321162Cd933E2Be498Cd2267a90534A804051b11";
    // chain link likes to use 8 decimals
    const btcPrice = BigNumber.from("4335410000000");
    const btcDecimals = 18;
    const feedDecimals = 8;

    const mockBtcPriceFeed = await ethers.getContractFactory(
      "MockChainlinkAggregator"
    );
    const btcPriceFeed = await mockBtcPriceFeed.deploy(btcPrice);

    await priceRetriever.addPriceFeed(
      btcAddress,
      btcPriceFeed.address,
      btcDecimals,
      feedDecimals
    );
    const priceFromFeed = await priceRetriever.priceOf(btcAddress);

    // we expect the original value, normalized to 18 decimals
    const expectedBtcPrice = BigNumber.from("43354100000000000000000");
    expect(priceFromFeed).to.equal(expectedBtcPrice);
  });

  it("returns less decimals if the token decimals < feed decimals", async () => {
    const usdcAddress = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";
    // chain link likes to use 8 decimals
    const usdcPrice = BigNumber.from("100000000");
    const usdcDecimals = 6;
    const feedDecimals = 8;

    const mockBtcPriceFeed = await ethers.getContractFactory(
      "MockChainlinkAggregator"
    );
    const btcPriceFeed = await mockBtcPriceFeed.deploy(usdcPrice);

    await priceRetriever.addPriceFeed(
      usdcAddress,
      btcPriceFeed.address,
      usdcDecimals,
      feedDecimals
    );
    const priceFromFeed = await priceRetriever.priceOf(usdcAddress);

    // we expect the original value, normalized to 6 decimals
    const expectedBtcPrice = BigNumber.from("1000000");
    expect(priceFromFeed).to.equal(expectedBtcPrice);
  });

  it("throws an exception if trying to retrieve price from an unsupported feed", async () => {
    const btcAddress = "0x321162Cd933E2Be498Cd2267a90534A804051b11";
    await expect(priceRetriever.priceOf(btcAddress)).to.be.revertedWith(
      "[PriceRetriever] Unsupported token"
    );
  });

  it("throws an exception if trying to add multiple times a feed for the same token", async () => {
    const btcAddress = "0x321162Cd933E2Be498Cd2267a90534A804051b11";
    // chain link likes to use 8 decimals
    const btcPrice = BigNumber.from("4335410000000");
    const btcDecimals = 18;
    const feedDecimals = 8;

    const mockBtcPriceFeed = await ethers.getContractFactory(
      "MockChainlinkAggregator"
    );
    const btcPriceFeed = await mockBtcPriceFeed.deploy(btcPrice);

    await priceRetriever.addPriceFeed(
      btcAddress,
      btcPriceFeed.address,
      btcDecimals,
      feedDecimals
    );
    await expect(
      priceRetriever.addPriceFeed(
        btcAddress,
        btcPriceFeed.address,
        btcDecimals,
        feedDecimals
      )
    ).to.be.revertedWith("[PriceRetriever] Token already has a price feed");
  });

  it("allows adding and removing price feeds", async () => {
    const btcAddress = "0x321162Cd933E2Be498Cd2267a90534A804051b11";
    // chain link likes to use 8 decimals
    const btcPrice = BigNumber.from("4335410000000");
    const btcDecimals = 18;
    const feedDecimals = 8;

    const mockBtcPriceFeed = await ethers.getContractFactory(
      "MockChainlinkAggregator"
    );
    const btcPriceFeed = await mockBtcPriceFeed.deploy(btcPrice);

    await priceRetriever.addPriceFeed(
      btcAddress,
      btcPriceFeed.address,
      btcDecimals,
      feedDecimals
    );
    await priceRetriever.removePriceFeed(btcAddress);
    await priceRetriever.addPriceFeed(
      btcAddress,
      btcPriceFeed.address,
      btcDecimals,
      feedDecimals
    );

    // no error means the test passes
  });

  it("throws an exception if trying to remove a price feed for a token that does not have one", async () => {
    const btcAddress = "0x321162Cd933E2Be498Cd2267a90534A804051b11";
    await expect(priceRetriever.removePriceFeed(btcAddress)).to.be.revertedWith(
      "[PriceRetriever] Token has no price feed"
    );
  });
});
