//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./interfaces/IGasTank.sol";
import "./interfaces/ITreasury.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GasTank is IGasTank, Ownable {
    ITreasury public treasury;
    mapping(address => uint256) balances;
    mapping(address => uint256) reward;
    mapping(address => bool) executors;

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setTreasury(address _treasury) external onlyOwner {
        treasury = ITreasury(_treasury);
    }

    function addExecutor(address executor) external onlyOwner {
        executors[executor] = true;
    }

    function removeExecutor(address executor) external onlyOwner {
        executors[executor] = false;
    }

    /** Checks whether the contract is ready to operate */
    function preliminaryCheck() external view {
        require(address(treasury) != address(0), "Treasury");
    }

    /* ========== VIEWS ========== */

    /// @inheritdoc IGasTank
    function balanceOf(address user) external view override returns (uint256) {
        return balances[user];
    }

    /// @inheritdoc IGasTank
    function claimable(address user) external view override returns (uint256) {
        return reward[user];
    }

    /* ========== EXTERNAL FUNCTIONS ========== */

    /// @inheritdoc IGasTank
    function deposit() external payable override {
        balances[msg.sender] = balances[msg.sender] + msg.value;
    }

    /// @inheritdoc IGasTank
    function withdraw(uint256 amount) external override {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] = balances[msg.sender] - amount;
        payable(msg.sender).transfer(amount);
    }

    /// @inheritdoc IGasTank
    function withdrawAll() external override {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    /// @inheritdoc IGasTank
    function addReward(
        uint256 amount,
        address user,
        address executor
    ) external override {
        require(executors[_msgSender()], "Unauthorized. Only Executors");
        balances[user] -= amount;
        reward[executor] += amount;
    }

    /// @inheritdoc IGasTank
    function claimReward() external override {
        uint256 due = reward[msg.sender];
        require(due > 0, "Nothing to claim");

        reward[msg.sender] = 0;
        treasury.requestPayout{value: due}(msg.sender);
    }

    /// @inheritdoc IGasTank
    function claimAndStakeReward() external override {
        uint256 due = reward[msg.sender];
        require(due > 0, "Nothing to claim");

        reward[msg.sender] = 0;
        treasury.stakePayout{value: due}(msg.sender);
    }
}
