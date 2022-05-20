import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { DaemonsContracts, updateContracts } from "../daemons-contracts";

export const deployPriceRetriever = async (
    chainId: number,
    contracts: DaemonsContracts,
): Promise<DaemonsContracts> => {
    console.log('Deploying price retriever');

    const priceRetrieverContract = await ethers.getContractFactory("PriceRetriever");
    const priceRetriever = await priceRetrieverContract.deploy();
    await priceRetriever.deployed();

    // const btcUsdFeed = '0x6135b13325bfC4B00278B4abC5e20bbce2D6580e';
    // const btcAddress = '0xd1b98b6607330172f1d991521145a22bce793277';
    // const btcDecimals = 8;
    // const btcFeedDecimals = 8;
    // await priceRetriever.addPriceFeed(btcAddress, btcUsdFeed, btcDecimals, btcFeedDecimals);
    // console.log("Added BTC price feed");

    // const ethUsdFeed = '0x9326BFA02ADD2366b30bacB125260Af641031331';
    // const ethAddress = '0xf3a6679b266899042276804930b3bfbaf807f15b';
    // const ethDecimals = 18;
    // const ethFeedDecimals = 8;
    // await priceRetriever.addPriceFeed(ethAddress, ethUsdFeed, ethDecimals, ethFeedDecimals);
    // console.log("Added ETH price feed");

    // const uniUsdFeed = '0xDA5904BdBfB4EF12a3955aEcA103F51dc87c7C39';
    // const uniAddress = '0x075a36ba8846c6b6f53644fdd3bf17e5151789dc';
    // const uniDecimals = 18;
    // const uniFeedDecimals = 8;
    // await priceRetriever.addPriceFeed(uniAddress, uniUsdFeed, uniDecimals, uniFeedDecimals);
    // console.log("Added UNI price feed");

    console.log("PriceRetriever deployed");
    return updateContracts(contracts, "PriceRetriever", priceRetriever.address);
}
