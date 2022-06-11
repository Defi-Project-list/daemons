// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "../interfaces/IUniswapV2Router.sol";
import "../interfaces/IUniswapV2Factory.sol";
import "./MockToken.sol";

contract MockUniswapV2Router is IUniswapV2Router01 {
    address private factoryAddress;

    function setFactory(address _factoryAddress) external {
        factoryAddress = _factoryAddress;
    }

    function factory() external view override returns (address) {
        return factoryAddress;
    }

    function WETH() external pure override returns (address) {
        return address(0);
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        override
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        )
    {
        // get LP address
        require(factoryAddress != address(0), "Factory has not been set");
        address lpToken = IUniswapV2Factory(factoryAddress).getPair(tokenA, tokenB);

        // get tokens from user and burn them
        MockToken(tokenA).transferFrom(msg.sender, address(this), amountADesired);
        MockToken(tokenB).transferFrom(msg.sender, address(this), amountBDesired);
        MockToken(tokenA).justBurn(address(this), amountADesired);
        MockToken(tokenB).justBurn(address(this), amountBDesired);

        // mint LP in user's wallet
        MockToken(lpToken).mint(to, amountADesired + amountBDesired);
        return (amountADesired, amountBDesired, amountADesired + amountBDesired);
    }

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    )
        external
        payable
        override
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        )
    {
        MockToken(token).transferFrom(msg.sender, address(this), amountTokenDesired);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external override returns (uint256 amountA, uint256 amountB) {
        // get LP address
        require(factoryAddress != address(0), "Factory has not been set");
        address lpToken = IUniswapV2Factory(factoryAddress).getPair(tokenA, tokenB);

        // get LP from user and burn it
        MockToken(lpToken).transferFrom(msg.sender, address(this), liquidity);
        MockToken(lpToken).justBurn(address(this), liquidity);

        // mint tokens to user's wallet
        MockToken(tokenA).mint(to, liquidity / 2);
        MockToken(tokenB).mint(to, liquidity / 2);
        return (liquidity / 2, liquidity / 2);
    }

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external override returns (uint256 amountToken, uint256 amountETH) {
        require(1 == 2, "'removeLiquidityETH' has not been implemented");
        return (0, 0);
    }

    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override returns (uint256 amountA, uint256 amountB) {
        require(1 == 2, "'removeLiquidityWithPermit' has not been implemented");
        return (0, 0);
    }

    function removeLiquidityETHWithPermit(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override returns (uint256 amountToken, uint256 amountETH) {
        require(1 == 2, "'removeLiquidityETHWithPermit' has not been implemented");
        return (0, 0);
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override returns (uint256[] memory amounts) {
        console.log("swapExactTokensForTokens");
        console.log("swapping", path[0], "to", path[1]);
        console.log("amount", amountIn, ", minimum accepted", amountOutMin);

        // Get tokens
        MockToken tokenFrom = MockToken(path[0]);
        tokenFrom.transferFrom(msg.sender, address(this), amountIn);

        // Mint tokens into the 'to' address
        MockToken tokenTo = MockToken(path[1]);
        tokenTo.mint(to, amountIn);

        uint256[] memory result = new uint256[](2);
        result[0] = amountIn;
        result[1] = amountIn;
        return result;
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override returns (uint256[] memory amounts) {
        require(1 == 2, "'swapTokensForExactTokens' has not been implemented");
        return new uint256[](2);
    }

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable override returns (uint256[] memory amounts) {
        require(1 == 2, "'swapExactETHForTokens' has not been implemented");
        return new uint256[](2);
    }

    function swapTokensForExactETH(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override returns (uint256[] memory amounts) {
        require(1 == 2, "'swapTokensForExactETH' has not been implemented");
        return new uint256[](2);
    }

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override returns (uint256[] memory amounts) {
        require(1 == 2, "'swapExactTokensForETH' has not been implemented");
        return new uint256[](2);
    }

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable override returns (uint256[] memory amounts) {
        require(1 == 2, "'swapETHForExactTokens' has not been implemented");
        return new uint256[](2);
    }

    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) external pure override returns (uint256 amountB) {
        require(1 == 2, "'quote' has not been implemented");
        return 0;
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure override returns (uint256 amountOut) {
        require(1 == 2, "'getAmountOut' has not been implemented");
        return 0;
    }

    function getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure override returns (uint256 amountIn) {
        require(1 == 2, "'getAmountIn' has not been implemented");
        return 0;
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        override
        returns (uint256[] memory amounts)
    {
        uint256[] memory result = new uint256[](2);
        result[0] = amountIn;
        result[1] = amountIn;
        return result;
    }

    function getAmountsIn(uint256 amountOut, address[] calldata path)
        external
        view
        override
        returns (uint256[] memory amounts)
    {
        require(1 == 2, "'getAmountsIn' has not been implemented");
        return new uint256[](2);
    }
}