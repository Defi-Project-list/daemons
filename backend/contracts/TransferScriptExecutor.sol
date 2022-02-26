// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./ConditionsChecker.sol";
import "./Messages.sol";
import "./interfaces/UniswapV2.sol";

contract TransferScriptExecutor is ConditionsChecker {
    uint256 public GAS_COST = 150000000000000; // 0.00015 ETH

    /* ========== HASH FUNCTIONS ========== */

    function hash(Transfer calldata transfer) private pure returns (bytes32) {
        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("Daemons-Transfer-v1"))
            )
        );

        bytes32 transferHash = keccak256(
            bytes.concat(
                abi.encode(
                    TRANSFER_TYPEHASH,
                    transfer.scriptId,
                    transfer.token,
                    transfer.destination,
                    transfer.amount,
                    transfer.user,
                    transfer.executor,
                    transfer.chainId
                ),
                abi.encodePacked(
                    hashBalance(transfer.balance),
                    hashFrequency(transfer.frequency),
                    hashPrice(transfer.price),
                    hashRepetitions(transfer.repetitions),
                    hashFollow(transfer.follow)
                )
            )
        );

        return
            keccak256(
                abi.encodePacked("\x19\x01", eip712DomainHash, transferHash)
            );
    }

    /* ========== VERIFICATION FUNCTIONS ========== */

    function verifySignature(
        Transfer calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) private view {
        require(message.chainId == chainId, "Wrong chain");
        require(
            message.user == ecrecover(hash(message), v, r, s),
            "Signature does not match"
        );
    }

    function verify(
        Transfer calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public view {
        verifyRevocation(message.user, message.scriptId);
        verifySignature(message, r, s, v);

        require(
            ERC20(message.token).balanceOf(message.user) > message.amount - 1,
            "User doesn't have enough balance"
        );

        verifyRepetitions(message.repetitions, message.scriptId);
        verifyFollow(message.follow, message.scriptId);
        verifyFrequency(message.frequency, message.scriptId);
        verifyBalance(message.balance, message.user);
        verifyPrice(message.price);
        verifyGasTank(message.user);
        verifyAllowance(message.user, message.token, message.amount);
    }

    /* ========== EXECUTION FUNCTIONS ========== */

    function execute(
        Transfer calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) external {
        verify(message, r, s, v);
        lastExecutions[message.scriptId] = block.timestamp;
        repetitionsCount[message.scriptId] += 1;

        // step 0 transfer the tokens to the destination
        IERC20 tokenFrom = IERC20(message.token);
        tokenFrom.transferFrom(
            message.user,
            message.destination,
            message.amount
        );

        // step 4: reward executor
        gasTank.addReward(
            GAS_COST * gasPriceFeed.lastGasPrice(),
            message.user,
            _msgSender()
        );
        emit Executed(message.scriptId, GAS_COST * gasPriceFeed.lastGasPrice());
    }
}
