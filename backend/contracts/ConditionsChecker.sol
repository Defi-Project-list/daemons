// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./Messages.sol";
import "./interfaces/IGasTank.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ConditionsChecker is Ownable {
    mapping(bytes32 => uint256) private lastExecutions;
    mapping(address => mapping(bytes32 => bool)) private revocations;

    address private gasTank;
    uint256 public MINIMUM_GAS_FOR_SCRIPT_EXECUTION = 1 ether;

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setGasTank(address _gasTank) external onlyOwner {
        gasTank = _gasTank;
    }

    function setMinimumGas(uint256 _amount) external onlyOwner {
        MINIMUM_GAS_FOR_SCRIPT_EXECUTION = _amount;
    }

    /* ========== PUBLIC FUNCTIONS ========== */

    function revoke(bytes32 _id) external {
        revocations[msg.sender][_id] = true;
    }

    /* ========== HASH FUNCTIONS ========== */

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
                    balance.comparison,
                    balance.amount
                )
            );
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

    /* ========== VERIFICATION FUNCTIONS ========== */

    /** Checks whether the user has revoked the script execution */
    function verifyRevocation(address user, bytes32 id) public view {
        require(!revocations[user][id], "Script has been revoked by the user");
    }

    /** Checks whether the user has enough funds in the GasTank to cover a script execution */
    function verifyGasTank(address user) public view {
        require(
            IGasTank(gasTank).balanceOf(user) >=
                MINIMUM_GAS_FOR_SCRIPT_EXECUTION,
            "[Gas Condition] Not enough gas in the tank"
        );
    }

    /** If the balance condition is enabled, it checks the user balance for it */
    function verifyBalance(Balance memory balance, address user) internal view {
        if (!balance.enabled) return;

        ERC20 token = ERC20(balance.token);
        uint256 userBalance = token.balanceOf(user);

        if (balance.comparison == 0x00)
            // less than
            require(
                userBalance > balance.amount,
                "[Balance Condition] User does not own enough tokens"
            );
        else if (balance.comparison == 0x01)
            // greater than
            require(
                userBalance < balance.amount,
                "[Balance Condition] User owns too many tokens"
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
                "[Frequency Condition] Not enough time has passed since the last execution"
            );
            return;
        }

        // the message has never been executed before
        require(
            block.number >= frequency.startBlock,
            "[Frequency Condition] Start block has not been reached yet"
        );

        require(
            block.number > frequency.startBlock + frequency.blocks,
            "[Frequency Condition] Not enough time has passed since the start block"
        );
    }
}
