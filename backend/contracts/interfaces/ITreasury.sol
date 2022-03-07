//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface ITreasury {
    /** The amount of DAEM tokens left to be distributed */
    function tokensForDistribution() external view returns (uint256);

    /** Function called by the gas tank to initialize a payout to the specified user */
    function requestPayout(address user) external payable;

    /** Function called by the gas tank to immediately stake the payout of the specified user */
    function stakePayout(address user) external payable;
}
