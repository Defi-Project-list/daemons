// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./Messages.sol";

abstract contract ConditionsChecker {
    mapping(bytes32 => uint256) private lastExecutions;

    /** Checks whether the user has enough funds in the GasTank to cover a script execution */
    function verifyGasTank(address user) public pure {
        //TODO
    }

    /** Returns the hashed version of the balance */
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

    /** If the balance condition is enabled, it checks the user balance for it */
    function verifyBalance(Balance memory balance, address user) internal pure {
        if (!balance.enabled) return;
        //TODO
    }

    /** Returns the hashed version of the frequency */
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

    /** If the frequency condition is enabled, it checks whether enough blocks have been minted since the last execution */
    function verifyFrequency(Frequency memory frequency, bytes32 id)
        internal
        view
    {
        if (!frequency.enabled) return;

        if (lastExecutions[id] > 0) {
            // the message has already been executed at least once
            require(
                block.number > lastExecutions[id] + frequency.blocks,
                "Not enough time has passed since the last execution"
            );
            return;
        }

        // the message has never been executed before
        require(
            block.number >= frequency.startBlock,
            "Start block has not been reached yet"
        );

        require(
            block.number > frequency.startBlock + frequency.blocks,
            "Not enough time has passed since the the start block"
        );
    }
}
