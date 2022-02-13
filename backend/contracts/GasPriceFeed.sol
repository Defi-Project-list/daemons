//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GasPriceFeed is Ownable {
    uint256 public lastGasPrice = 1;

    /** Sets the latest gas price.
     * This value will be used as reference to pay out the executors rewards.
     */
    function setGasPrice(uint256 gasPrice) external onlyOwner {
        require(gasPrice > 0, "GasPrice must be greater than 0");
        lastGasPrice = gasPrice;
    }
}
