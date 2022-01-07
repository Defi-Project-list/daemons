//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface IGasTank {
    function balanceOf(address user) external view returns (uint256);

    function deposit() external payable;

    function withdraw(uint256 amount) external;

    function withdrawAll() external;
}
