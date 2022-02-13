//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface IPriceRetriever {
    /** Gets the price of the specified token, in USD */
    function priceOf(address token) external view returns (uint256);
}
