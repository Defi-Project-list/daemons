// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**  CONDITIONS

    User can use multiple conditions in their scripts and all of them will be checked.
    All conditions will be added to all actions.

 */

struct Balance {
    bool enabled;
    address token;
    bytes1 comparison;
    uint256 amount;
}
string constant BALANCE_TYPE = "Balance(bool enabled,address token,bytes1 comparison,uint256 amount)";
bytes32 constant BALANCE_TYPEHASH = keccak256(abi.encodePacked(BALANCE_TYPE));

struct Frequency {
    bool enabled;
    uint256 blocks;
    uint256 startBlock;
}
string constant FREQUENCY_TYPE = "Frequency(bool enabled,uint256 blocks,uint256 startBlock)";
bytes32 constant FREQUENCY_TYPEHASH = keccak256(
    abi.encodePacked(FREQUENCY_TYPE)
);

/**  ACTIONS

    Each action type will be executed by a different contract, called 'executor'.
    All executors inherit from the same class so they are able to verify the conditions.

 */

struct Swap {
    bytes32 id;
    address tokenFrom;
    address tokenTo;
    uint256 amount;
    address user;
    address executor;
    Balance balance;
    Frequency frequency;
}
string constant SWAP_TYPE = "Swap(bytes32 id,address tokenFrom,address tokenTo,uint256 amount,address user,address executor,Balance balance,Frequency frequency)Balance(bool enabled,address token,bytes1 comparison,uint256 amount)Frequency(bool enabled,uint256 blocks,uint256 startBlock)";
bytes32 constant SWAP_TYPEHASH = keccak256(abi.encodePacked(SWAP_TYPE));
