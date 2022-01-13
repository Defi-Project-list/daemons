// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorInterface.sol";
import "./interfaces/IPriceRetriever.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceRetriever is Ownable, IPriceRetriever {
    mapping(address => address) priceFeeds;

    /* ========== PUBLIC FUNCTIONS ========== */

    function priceOf(address token) external view override returns (int256) {
        require(
            priceFeeds[token] != address(0),
            "[PriceRetriever] Unsupported token"
        );
        return AggregatorInterface(priceFeeds[token]).latestAnswer();
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /** Adds a price feed contract associated to a certain token */
    function addPriceFeed(address token, address priceFeed) external onlyOwner {
        require(
            priceFeeds[token] == address(0),
            "[PriceRetriever] Token already has a price feed"
        );
        priceFeeds[token] = priceFeed;
    }

    /** Removes the price feed associated to a certain token */
    function removePriceFeed(address token) external onlyOwner {
        require(
            priceFeeds[token] != address(0),
            "[PriceRetriever] Token has no price feed"
        );
        priceFeeds[token] = address(0);
    }
}
