// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./ConditionsChecker.sol";
import "./Messages.sol";

contract SwapperScriptExecutor is ConditionsChecker {
    // domain definition
    string private constant EIP712_DOMAIN = "EIP712Domain(string name)";
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256(abi.encodePacked(EIP712_DOMAIN));

    function hash(Swap memory swap) private pure returns (bytes32) {
        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("Balrog-Swap-v1"))
            )
        );

        bytes32 swapHash = keccak256(
            abi.encode(
                SWAP_TYPEHASH,
                swap.id,
                swap.tokenFrom,
                swap.tokenTo,
                swap.amount,
                swap.user,
                swap.executor,
                hashBalance(swap.balance),
                hashFrequency(swap.frequency)
            )
        );

        return
            keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, swapHash));
    }

    function verify(
        Swap memory message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public view returns (bool) {
        console.log("hash");
        console.logBytes32(hash(message));
        console.log("user", message.user);

        return message.user == ecrecover(hash(message), v, r, s);
    }
}
