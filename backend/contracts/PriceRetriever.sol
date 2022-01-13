// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorInterface.sol";
import "./interfaces/IPriceRetriever.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceRetriever is Ownable, IPriceRetriever {
    struct TokenInfo {
        address priceFeed;
        uint8 tokenDecimals;
        uint8 priceFeedDecimals;
    }

    mapping(address => TokenInfo) priceFeeds;

    /* ========== PUBLIC FUNCTIONS ========== */

    function priceOf(address token) external view override returns (uint256) {
        require(
            priceFeeds[token].priceFeed != address(0),
            "[PriceRetriever] Unsupported token"
        );
        int256 price = AggregatorInterface(priceFeeds[token].priceFeed)
            .latestAnswer();
        require(price > 0, "[PriceRetriever] Unsupported negative value");
        return
            normalizeDecimals(
                uint256(price),
                priceFeeds[token].tokenDecimals,
                priceFeeds[token].priceFeedDecimals
            );
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /** Adds a price feed contract associated to a certain token */
    function addPriceFeed(
        address token,
        address priceFeed,
        uint8 tokenDecimals,
        uint8 priceFeedDecimals
    ) external onlyOwner {
        require(
            priceFeeds[token].priceFeed == address(0),
            "[PriceRetriever] Token already has a price feed"
        );
        priceFeeds[token] = TokenInfo({
            priceFeed: priceFeed,
            tokenDecimals: tokenDecimals,
            priceFeedDecimals: priceFeedDecimals
        });
    }

    /** Removes the price feed associated to a certain token */
    function removePriceFeed(address token) external onlyOwner {
        require(
            priceFeeds[token].priceFeed != address(0),
            "[PriceRetriever] Token has no price feed"
        );
        delete priceFeeds[token];
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    function normalizeDecimals(
        uint256 value,
        uint8 tokenDecimals,
        uint8 priceFeedDecimals
    ) private pure returns (uint256) {
        if (tokenDecimals > priceFeedDecimals) {
            // token has more decimals than the feed. we need to remove from the result
            return value * 10**(tokenDecimals - priceFeedDecimals);
        }

        // token has less decimals than the feed. we need to remove from the result
        return value / 10**(priceFeedDecimals - tokenDecimals);
    }
}
