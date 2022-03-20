// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./ConditionsChecker.sol";
import "./Messages.sol";
import "./interfaces/IMoneyMarket.sol";

contract MmBaseScriptExecutor is ConditionsChecker {
    uint256 public GAS_COST = 300000000000000; // 0.00030 ETH
    mapping(address => mapping(IERC20 => bool)) private allowances;

    /* ========== HASH FUNCTIONS ========== */

    function hash(MmBase calldata mm) private pure returns (bytes32) {
        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("Daemons-MM-Base-v01"))
            )
        );

        bytes32 mmHash = keccak256(
            bytes.concat(
                abi.encode(
                    MM_BASE_TYPEHASH,
                    mm.scriptId,
                    mm.token,
                    mm.aToken,
                    mm.action,
                    mm.typeAmt,
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
        MmBase calldata message,
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
        MmBase calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public view {
        verifyRevocation(message.user, message.scriptId);
        verifySignature(message, r, s, v);

        // check if the action can be performed
        // if typeAmt==Absolute -> it's the amount in the message,
        // otherwise it's enough if the user has more than 0 in the wallet.
        address tokenAddr = message.action == 0x00
            ? message.token
            : message.aToken;
        uint256 minAmount = message.typeAmt == 0 ? message.amount - 1 : 0;
        require(
            ERC20(tokenAddr).balanceOf(message.user) > minAmount,
            "User doesn't have enough balance"
        );

        verifyRepetitions(message.repetitions, message.scriptId);
        verifyFollow(message.follow, message.scriptId);
        verifyFrequency(message.frequency, message.scriptId);
        verifyBalance(message.balance, message.user);
        verifyPrice(message.price);
        verifyGasTank(message.user);
        verifyAllowance(message.user, tokenAddr, minAmount);
    }

    /* ========== EXECUTION FUNCTIONS ========== */

    function execute(
        MmBase calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) external {
        verify(message, r, s, v);
        lastExecutions[message.scriptId] = block.timestamp;
        repetitionsCount[message.scriptId] += 1;

        if (message.action == 0x00) {
            supply(message);
        } else if (message.action == 0x01) {
            withdraw(message);
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

    function withdraw(MmBase calldata message) private {
        // step 0 get the aTokens from the user
        IERC20 aToken = IERC20(message.aToken);
        uint256 amount = message.typeAmt == 0 // absolute type: just return the given amount
            ? message.amount // percentage type: the amount represents a percentage on 10000
            : (aToken.balanceOf(message.user) * message.amount) / 10000;
        aToken.transferFrom(message.user, address(this), amount);

        // step 1 call withdraw function
        IMoneyMarket(message.kontract).withdraw(
            message.token,
            amount,
            message.user
        );
    }

    function supply(MmBase calldata message) private {
        // step 0 get the Tokens from the user
        IERC20 tokenFrom = IERC20(message.token);
        uint256 amount = message.typeAmt == 0 // absolute type: just return the given amount
            ? message.amount // percentage type: the amount represents a percentage on 10000
            : (tokenFrom.balanceOf(message.user) * message.amount) / 10000;
        tokenFrom.transferFrom(message.user, address(this), amount);

        // step 1 grant allowance to the router if it has not been given yet
        if (!allowances[message.kontract][tokenFrom])
            giveAllowance(tokenFrom, message.kontract);

        // step 2 call supply function
        IMoneyMarket(message.kontract).supply(
            message.token,
            amount,
            message.user,
            0
        );
    }
}