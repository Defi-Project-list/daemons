//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./interfaces/IGasTank.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract GasTank is IGasTank {
    using SafeMath for uint256;

    mapping(address => uint256) balances;

    function balanceOf(address user) external view override returns (uint256) {
        return balances[user];
    }

    function deposit() external payable override {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
    }

    function withdraw(uint256 amount) external override {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] = balances[msg.sender].sub(amount);
        payable(msg.sender).transfer(amount);
    }

    function withdrawAll() external override {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
