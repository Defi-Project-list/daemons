// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./Messages.sol";

abstract contract ConditionsChecker {
    function hashBalance(Balance memory balance)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    BALANCE_TYPEHASH,
                    balance.enabled,
                    balance.token,
                    keccak256(abi.encodePacked(balance.comparison)),
                    balance.amount
                )
            );
    }

    function checkBalance(Balance memory balance, address user)
        internal
        pure
        returns (bool)
    {
        return true;
    }

    function hashFrequency(Frequency memory frequency)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    FREQUENCY_TYPEHASH,
                    frequency.enabled,
                    frequency.blocks,
                    frequency.startBlock
                )
            );
    }

    function checkFrequency(Frequency memory frequency, address user)
        internal
        pure
        returns (bool)
    {
        return true;
    }
}
