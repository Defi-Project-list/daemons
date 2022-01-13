import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';

describe("Price Retriever", function () {

    let owner: SignerWithAddress;
    let priceRetriever: Contract;

    this.beforeEach(async () => {
        // get owner
        [owner] = await ethers.getSigners();

        // instantiate Mock Price Retriever contracts
        const PriceRetrieverContract = await ethers.getContractFactory("PriceRetriever");
        priceRetriever = await PriceRetrieverContract.deploy();
    });

    it('allows adding a price feeds and retrieving data', async () => {
        const btcAddress = '0x321162Cd933E2Be498Cd2267a90534A804051b11';
        const btcPrice = BigNumber.from('4335410000000'); // chain link likes to use 8 decimals

        const mockBtcPriceFeed = await ethers.getContractFactory("MockChainlinkAggregator");
        const btcPriceFeed = await mockBtcPriceFeed.deploy(btcPrice);

        await priceRetriever.addPriceFeed(btcAddress, btcPriceFeed.address);
        const priceFromFeed = await priceRetriever.priceOf(btcAddress);

        expect(priceFromFeed).to.equal(btcPrice);
    });

    it('throws an exception if trying to retrieve price from an unsupported feed', async () => {
        const btcAddress = '0x321162Cd933E2Be498Cd2267a90534A804051b11';
        await expect(priceRetriever.priceOf(btcAddress)).to.be.revertedWith('[PriceRetriever] Unsupported token');
    });

    it('throws an exception if trying to add multiple times a feed for the same token', async () => {
        const btcAddress = '0x321162Cd933E2Be498Cd2267a90534A804051b11';
        const btcPrice = BigNumber.from('4335410000000'); // chain link likes to use 8 decimals

        const mockBtcPriceFeed = await ethers.getContractFactory("MockChainlinkAggregator");
        const btcPriceFeed = await mockBtcPriceFeed.deploy(btcPrice);

        await priceRetriever.addPriceFeed(btcAddress, btcPriceFeed.address);
        await expect(priceRetriever.addPriceFeed(btcAddress, btcPriceFeed.address)).to.be.revertedWith('[PriceRetriever] Token already has a price feed');
    });

    it('allows adding and removing price feeds', async () => {
        const btcAddress = '0x321162Cd933E2Be498Cd2267a90534A804051b11';
        const btcPrice = BigNumber.from('4335410000000'); // chain link likes to use 8 decimals

        const mockBtcPriceFeed = await ethers.getContractFactory("MockChainlinkAggregator");
        const btcPriceFeed = await mockBtcPriceFeed.deploy(btcPrice);

        await priceRetriever.addPriceFeed(btcAddress, btcPriceFeed.address);
        await priceRetriever.removePriceFeed(btcAddress);
        await priceRetriever.addPriceFeed(btcAddress, btcPriceFeed.address);

        // no error means the test passes
    });

    it('throws an exception if trying to remove a price feed for a token that does not have one', async () => {
        const btcAddress = '0x321162Cd933E2Be498Cd2267a90534A804051b11';
        await expect(priceRetriever.removePriceFeed(btcAddress)).to.be.revertedWith('[PriceRetriever] Token has no price feed');
    });
});
