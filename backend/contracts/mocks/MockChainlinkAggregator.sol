// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorInterface.sol";

contract MockChainlinkAggregator is AggregatorInterface {
    int256 private price;

    constructor(int256 _price) {
        price = _price;
    }

    function latestAnswer() external view override returns (int256) {
        return price;
    }

    function latestTimestamp() external pure override returns (uint256) {
        return 0;
    }

    function latestRound() external pure override returns (uint256) {
        return 0;
    }

    function getAnswer(uint256 roundId)
        external
        pure
        override
        returns (int256)
    {
        return 0;
    }

    function getTimestamp(uint256 roundId)
        external
        pure
        override
        returns (uint256)
    {
        return 0;
    }
}
