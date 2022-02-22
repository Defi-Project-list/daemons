// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./ConditionsChecker.sol";
import "./Messages.sol";
import "./interfaces/UniswapV2.sol";

contract TransferPctScriptExecutor is ConditionsChecker {
    uint256 public GAS_COST = 125;

    /* ========== HASH FUNCTIONS ========== */

    function hash(TransferPct calldata transfer)
        private
        pure
        returns (bytes32)
    {
        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("Daemons-Transfer-Pct-v1"))
            )
        );

        bytes32 transferHash = keccak256(
            bytes.concat(
                abi.encode(
                    TRANSFER_PCT_TYPEHASH,
                    transfer.scriptId,
                    transfer.token,
                    transfer.destination,
                    transfer.percentage,
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
        TransferPct calldata message,
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
        TransferPct calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public view {
        IERC20 tokenFrom = IERC20(message.token);
        uint256 balance = tokenFrom.balanceOf(message.user);
        uint256 amount = (balance * message.percentage) / 10000;

        console.log("balance", balance);
        console.log("amount", amount);

        verifyRevocation(message.user, message.scriptId);
        verifySignature(message, r, s, v);

        require(
            ERC20(message.token).balanceOf(message.user) > 0,
            "User doesn't have enough balance"
        );

        verifyRepetitions(message.repetitions, message.scriptId);
        verifyFollow(message.follow, message.scriptId);
        verifyFrequency(message.frequency, message.scriptId);
        verifyBalance(message.balance, message.user);
        verifyPrice(message.price);
        verifyGasTank(message.user);
        verifyAllowance(
            message.user,
            message.token,
            (ERC20(message.token).balanceOf(message.user) *
                message.percentage) / 10000
        );
    }

    /* ========== EXECUTION FUNCTIONS ========== */

    function execute(
        TransferPct calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) external {
        verify(message, r, s, v);
        lastExecutions[message.scriptId] = block.timestamp;
        repetitionsCount[message.scriptId] += 1;

        // step 0 transfer the tokens to the destination
        IERC20 tokenFrom = IERC20(message.token);
        uint256 amount = (tokenFrom.balanceOf(message.user) *
            message.percentage) / 10000;
        tokenFrom.transferFrom(message.user, message.destination, amount);

        // step 1: reward executor
        gasTank.addReward(
            GAS_COST * gasPriceFeed.lastGasPrice(),
            message.user,
            _msgSender()
        );
    }
}
