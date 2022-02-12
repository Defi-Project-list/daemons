//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface ITreasury {
    /** Function called by the gas tank to initialize a payout to the specified user */
    function requestPayout(address user) external payable;
}
