//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./interfaces/ITreasury.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is ITreasury, Ownable {
    address private gasTank;
    IERC20 private token;

    uint16 public PERCENTAGE_COMMISSION = 100;
    uint16 public PERCENTAGE_POL = 4900;
    // the remaining percentage will be redistributed

    uint256 public redistributionPool;
    uint256 public commissionsPool;
    uint256 public polPool;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _token, address _gasTank) {
        require(_token != address(0));
        token = IERC20(_token);
        gasTank = _gasTank;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setGasTank(address _gasTank) external onlyOwner {
        gasTank = _gasTank;
    }

    /** Checks whether the contract is ready to operate */
    function preliminaryCheck() external view {
        require(address(gasTank) != address(0), "GasTank");
        require(token.balanceOf(address(this)) > 0, "Treasury is empty");
    }

    function setCommissionPercentage(uint16 value) external onlyOwner {
        require(value <= 500, "Commission must be at most 5%");
        PERCENTAGE_COMMISSION = value;
    }

    function setPolPercentage(uint16 value) external onlyOwner {
        require(value >= 500, "POL must be at least 5%");
        require(value <= 5000, "POL must be at most 50%");
        PERCENTAGE_POL = value;
    }

    function claimCommission() external onlyOwner {
        uint256 amount = commissionsPool;
        commissionsPool = 0;
        payable(_msgSender()).transfer(amount);
    }

    function requestPayout(address user) external payable override {
        require(gasTank == _msgSender(), "Unauthorized. Only GasTank");

        // split funds
        commissionsPool += (msg.value * PERCENTAGE_COMMISSION) / 10000;
        polPool += (msg.value * PERCENTAGE_POL) / 10000;
        redistributionPool +=
            (msg.value * (10000 - PERCENTAGE_COMMISSION - PERCENTAGE_POL)) /
            10000;

        //TODO: currently transferring 1:1
        token.transfer(user, msg.value);
    }
}
