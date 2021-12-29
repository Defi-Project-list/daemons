//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./interfaces/UniswapV2.sol";

contract Example1 {
    address internal constant UNISWAP_ROUTER_ADDRESS =
        0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;

    IUniswapV2Router02 public uniswapRouter;
    address private multiDaiKovan = 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa;

    constructor() {
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }

    function convertEthToDai(uint256 daiAmount) public payable {
        uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        uniswapRouter.swapETHForExactTokens{value: msg.value}(
            daiAmount,
            getPathForETHtoDAI(),
            address(this),
            deadline
        );

        // refund leftover ETH to user
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "refund failed");
    }

    function getEstimatedETHforDAI(uint256 daiAmount)
        public
        view
        returns (uint256[] memory)
    {
        return uniswapRouter.getAmountsIn(daiAmount, getPathForETHtoDAI());
    }

    function getPathForETHtoDAI() private view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = multiDaiKovan;

        return path;
    }

    // important to receive ETH
    receive() external payable {}
}
