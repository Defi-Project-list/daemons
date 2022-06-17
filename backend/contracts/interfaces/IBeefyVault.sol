//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBeefyVault is IERC20 {
    function deposit(uint _amount) external;
    function withdraw(uint256 _shares) external;
}
