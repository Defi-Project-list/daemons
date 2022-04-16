// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../interfaces/IMoneyMarket.sol";
import "./MockToken.sol";

contract MockMoneyMarketPool is IMoneyMarket {
    MockToken private token;
    MockToken private aToken;

    constructor(address _token, address _aToken) {
        token = MockToken(_token);
        aToken = MockToken(_aToken);
    }

    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external override {
        require(asset == address(token), "Always specify token, not aToken");

        // get tokens from the executor
        token.transferFrom(msg.sender, address(this), amount);

        // burn them, for simplicity
        token.burn(amount);

        // mint aTokens into the user's address
        aToken.mint(onBehalfOf, amount);
    }

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external override returns (uint256) {
        require(asset == address(token), "Always specify token, not aToken");

        // burn message sender aTokens
        aToken.justBurn(msg.sender, amount);

        // mint tokens into the user's address
        token.mint(to, amount);

        return 0;
    }

    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external override {
        require(asset == address(token), "Always specify token, not aToken");

        // mint tokens into the **SENDER** address
        token.mint(msg.sender, amount);
    }

    function repay(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        address onBehalfOf
    ) external override returns (uint256) {
        require(asset == address(token), "Always specify token, not aToken");

        // get tokens from the executor
        token.transferFrom(msg.sender, address(this), amount);

        // burn them, for simplicity
        token.burn(amount);

        return 0;
    }

    function getUserAccountData(address user)
        external
        view
        override
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        return (0, 0, 0, 0, 0, 2e18);
    }
}
