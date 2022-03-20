// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./ConditionsChecker.sol";
import "./Messages.sol";
import "./interfaces/IMoneyMarket.sol";

contract MmAdvancedScriptExecutor is ConditionsChecker {
    uint256 public GAS_COST = 300000000000000; // 0.00030 ETH
    mapping(address => mapping(IERC20 => bool)) private allowances;

    /* ========== HASH FUNCTIONS ========== */

    function hash(MmAdvanced calldata mm) private pure returns (bytes32) {
        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("Daemons-MM-Advanced-v01"))
            )
        );

        bytes32 mmHash = keccak256(
            bytes.concat(
                abi.encode(
                    MM_ADVANCED_TYPEHASH,
                    mm.scriptId,
                    mm.token,
                    mm.action,
                    mm.rateMode,
                    mm.amount,
                    mm.user,
                    mm.kontract,
                    mm.executor,
                    mm.chainId
                ),
                abi.encodePacked(
                    hashBalance(mm.balance),
                    hashFrequency(mm.frequency),
                    hashPrice(mm.price),
                    hashRepetitions(mm.repetitions),
                    hashFollow(mm.follow)
                )
            )
        );

        return
            keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, mmHash));
    }

    /* ========== VERIFICATION FUNCTIONS ========== */

    function verifySignature(
        MmAdvanced calldata message,
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
        MmAdvanced calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public view {
        verifyRevocation(message.user, message.scriptId);
        verifySignature(message, r, s, v);

        if (message.action == 0x00) {
            // For repay we just need to see that we have enough tokens
            require(
                ERC20(message.token).balanceOf(message.user) >
                    message.amount - 1,
                "User doesn't have enough balance"
            );
        }
        // if BORROW we always allow. In the future we'll use data from getUserAccountData.

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
        MmAdvanced calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) external {
        verify(message, r, s, v);
        lastExecutions[message.scriptId] = block.timestamp;
        repetitionsCount[message.scriptId] += 1;

        if (message.action == 0x00) {
            repay(message);
        } else if (message.action == 0x01) {
            borrow(message);
        }

        // Reward executor
        gasTank.addReward(
            GAS_COST * gasPriceFeed.lastGasPrice(),
            message.user,
            _msgSender()
        );
        emit Executed(message.scriptId, GAS_COST * gasPriceFeed.lastGasPrice());
    }

    function giveAllowance(IERC20 _token, address _exchange) private {
        IERC20(_token).approve(
            _exchange,
            0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        );
        allowances[_exchange][_token] = true;
    }

    function repay(MmAdvanced calldata message) private {
        // step 0 get the Tokens from the user
        IERC20 tokenFrom = IERC20(message.token);
        tokenFrom.transferFrom(message.user, address(this), message.amount);

        // step 1 grant allowance to the router if it has not been given yet
        if (!allowances[message.kontract][tokenFrom])
            giveAllowance(tokenFrom, message.kontract);

        // step 2 call repay function
        IMoneyMarket(message.kontract).repay(
            message.token,
            message.amount,
            message.rateMode == 0x01 ? 1 : 2,
            message.user
        );
    }

    function borrow(MmAdvanced calldata message) private {
        // step 1 call withdraw function
        // NOTE: amount is always absolute
        IMoneyMarket(message.kontract).borrow(
            message.token,
            message.amount,
            message.rateMode == 0x01 ? 1 : 2,
            0,
            message.user
        );

        // step 2 send borrowed tokens to user
        IERC20(message.token).transfer(message.user, message.amount);
    }
}
