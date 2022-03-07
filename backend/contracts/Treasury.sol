//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./interfaces/ITreasury.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Contract taking care of:
 * - rewarding users for the executions of scripts
 * - taking care of rewards distributions to users that staked DAEM
 * - holds the commissions money, until it's withdrawn by the owner
 * - buy and hold the DAEM-ETH LP
 */
contract Treasury is ITreasury, Ownable {
    address private gasTank;
    IERC20 private token;

    uint16 public PERCENTAGE_COMMISSION = 100;
    uint16 public PERCENTAGE_POL = 4900;
    // the remaining percentage will be redistributed

    uint256 public redistributionPool;
    uint256 public commissionsPool;
    uint256 public polPool;

    // staking vars
    uint256 public redistributionInterval = 180 days;
    uint256 public stakedAmount;
    uint256 private lastUpdateTime;
    uint256 private rewardPerTokenStored;
    mapping(address => uint256) private balances;
    mapping(address => uint256) private userRewardPerTokenPaid;
    mapping(address => uint256) private rewards;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _token, address _gasTank) {
        require(_token != address(0));
        token = IERC20(_token);
        gasTank = _gasTank;
    }

    /* ========== VIEWS STAKING ========== */

    function tokensForDistribution() external view override returns (uint256) {
        return token.balanceOf(address(this)) - stakedAmount;
    }

    function balanceOf(address user) external view returns (uint256) {
        return balances[user];
    }

    function earned(address user) public view returns (uint256) {
        return
            ((balances[user] *
                (rewardPerToken() - userRewardPerTokenPaid[user])) / 1e18) +
            rewards[user];
    }

    function rewardPerToken() public view returns (uint256) {
        if (stakedAmount == 0) return 0;
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * getRewardRate() * 1e18) /
                stakedAmount);
    }

    /**
     * Number of ETH that will be distributed each second.
     * This depends on the amount in the redistributionPool and the
     * time we intend to distribute this amount in.
     */
    function getRewardRate() public view returns (uint256) {
        return redistributionPool / redistributionInterval;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        token.transferFrom(msg.sender, address(this), amount);
        stakedAmount += amount;
        balances[msg.sender] += amount;
    }

    function stakeFor(address user, uint256 amount) private updateReward(user) {
        require(amount > 0, "Cannot stake 0");
        // no need to move funds as the tokens are already in the treasury
        stakedAmount += amount;
        balances[user] += amount;
    }

    function withdraw(uint256 amount) public updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= amount, "Insufficient staked funds");
        require(stakedAmount > amount, "Cannot withdraw all funds");
        stakedAmount -= amount;
        balances[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
    }

    function getReward() public updateReward(msg.sender) {
        require(rewards[msg.sender] > 0, "Nothing to claim");
        uint256 reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);
    }

    function exit() external {
        getReward();
        withdraw(balances[msg.sender]);
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

    function setRedistributionInterval(uint256 newInterval) external onlyOwner {
        require(newInterval >= 30 days, "RI must be at least 30 days");
        require(newInterval <= 730 days, "RI must be at most 730 days");
        redistributionInterval = newInterval;
    }

    function claimCommission() external onlyOwner {
        uint256 amount = commissionsPool;
        commissionsPool = 0;
        payable(_msgSender()).transfer(amount);
    }

    /* ========== EXTERNAL FUNCTIONS ========== */

    function requestPayout(address user) external payable override {
        require(gasTank == _msgSender(), "Unauthorized. Only GasTank");
        token.transfer(user, calculatePayout());
    }

    function stakePayout(address user) external payable override {
        require(gasTank == _msgSender(), "Unauthorized. Only GasTank");
        stakeFor(user, calculatePayout());
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    function calculatePayout() private returns (uint256) {
        // split funds
        commissionsPool += (msg.value * PERCENTAGE_COMMISSION) / 10000;
        polPool += (msg.value * PERCENTAGE_POL) / 10000;
        redistributionPool +=
            (msg.value * (10000 - PERCENTAGE_COMMISSION - PERCENTAGE_POL)) /
            10000;

        // calculate payout
        //TODO: currently transferring 1:1
        return msg.value;
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        rewards[account] = earned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
        _;
    }
}
