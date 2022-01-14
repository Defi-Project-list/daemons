// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./ConditionsChecker.sol";
import "./Messages.sol";
import "./interfaces/UniswapV2.sol";

contract TransferScriptExecutor is ConditionsChecker {
    /* ========== HASH FUNCTIONS ========== */

    function hash(Transfer memory transfer) private pure returns (bytes32) {
        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("Balrog-Transfer-v1"))
            )
        );

        bytes32 swapHash = keccak256(
            abi.encode(
                TRANSFER_TYPEHASH,
                transfer.id,
                transfer.token,
                transfer.destination,
                transfer.amount,
                transfer.user,
                transfer.executor,
                hashBalance(transfer.balance),
                hashFrequency(transfer.frequency),
                hashPrice(transfer.price)
            )
        );

        return
            keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, swapHash));
    }

    /* ========== VERIFICATION FUNCTIONS ========== */

    function verifySignature(
        Transfer memory message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) private pure {
        require(
            message.user == ecrecover(hash(message), v, r, s),
            "Signature does not match"
        );
    }

    function verify(
        Transfer memory message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public view {
        verifyRevocation(message.user, message.id);
        verifySignature(message, r, s, v);
        verifyFrequency(message.frequency, message.id);
        verifyBalance(message.balance, message.user);
        verifyPrice(message.price);
        verifyGasTank(message.user);
        verifyAllowance(message.user, message.token, message.amount);
    }

    /* ========== EXECUTION FUNCTIONS ========== */

    function execute(
        Transfer memory message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public {
        verify(message, r, s, v);
        lastExecutions[message.id] = block.number;

        // step 0 transfer the tokens to the destination
        IERC20 tokenFrom = IERC20(message.token);
        tokenFrom.transferFrom(
            message.user,
            message.destination,
            message.amount
        );

        // step 2: reward executor
        // -> gas tank send a certain amount of ETH from the user balance to the treasury (still in gas tank?)
        // -> gas tank reward msg.sender with some freshly minted Brg tokens
        // -> end
    }
}
