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

struct Price {
    bool enabled;
    address token;
    bytes1 comparison;
    uint256 value;
}
string constant PRICE_TYPE = "Price(bool enabled,address token,bytes1 comparison,uint256 value)";
bytes32 constant PRICE_TYPEHASH = keccak256(abi.encodePacked(PRICE_TYPE));

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
    Price price;
}
string constant SWAP_TYPE = "Swap(bytes32 id,address tokenFrom,address tokenTo,uint256 amount,address user,address executor,Balance balance,Frequency frequency,Price price)Balance(bool enabled,address token,bytes1 comparison,uint256 amount)Frequency(bool enabled,uint256 blocks,uint256 startBlock)Price(bool enabled,address token,bytes1 comparison,uint256 value)";
bytes32 constant SWAP_TYPEHASH = keccak256(abi.encodePacked(SWAP_TYPE));

struct Transfer {
    bytes32 id;
    address token;
    address destination;
    uint256 amount;
    address user;
    address executor;
    Balance balance;
    Frequency frequency;
    Price price;
}
string constant TRANSFER_TYPE = "Transfer(bytes32 id,address token,address destination,uint256 amount,address user,address executor,Balance balance,Frequency frequency,Price price)Balance(bool enabled,address token,bytes1 comparison,uint256 amount)Frequency(bool enabled,uint256 blocks,uint256 startBlock)Price(bool enabled,address token,bytes1 comparison,uint256 value)";
bytes32 constant TRANSFER_TYPEHASH = keccak256(abi.encodePacked(TRANSFER_TYPE));
