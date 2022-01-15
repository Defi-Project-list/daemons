// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./ConditionsChecker.sol";
import "./Messages.sol";
import "./interfaces/UniswapV2.sol";

contract SwapperScriptExecutor is ConditionsChecker {
    // exchange address
    address private exchange;
    mapping(address => mapping(IERC20 => bool)) private allowances;

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setExchange(address _exchange) external onlyOwner {
        exchange = _exchange;
    }

    /* ========== HASH FUNCTIONS ========== */

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
                swap.scriptId,
                swap.tokenFrom,
                swap.tokenTo,
                swap.amount,
                swap.user,
                swap.executor,
                swap.chainId,
                hashBalance(swap.balance),
                hashFrequency(swap.frequency),
                hashPrice(swap.price)
            )
        );

        return
            keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, swapHash));
    }

    /* ========== VERIFICATION FUNCTIONS ========== */

    function verifySignature(
        Swap memory message,
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
        Swap memory message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public view {
        verifyRevocation(message.user, message.scriptId);
        verifySignature(message, r, s, v);
        verifyFrequency(message.frequency, message.scriptId);
        verifyBalance(message.balance, message.user);
        verifyPrice(message.price);
        verifyGasTank(message.user);
        verifyAllowance(message.user, message.tokenFrom, message.amount);
    }

    /* ========== EXECUTION FUNCTIONS ========== */

    function execute(
        Swap memory message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public {
        verify(message, r, s, v);
        require(exchange != address(0), "Exchange address has not been set");
        lastExecutions[message.scriptId] = block.number;

        // step 0 get the tokens from the user
        IERC20 tokenFrom = IERC20(message.tokenFrom);
        tokenFrom.transferFrom(message.user, address(this), message.amount);

        // step 1: get the path
        address[] memory path = new address[](2);
        path[0] = message.tokenFrom;
        path[1] = message.tokenTo;

        // step 2: grant allowance to the router if it has not been given yet
        if (!allowances[exchange][tokenFrom])
            giveAllowance(tokenFrom, exchange);

        // step 3: swap
        IUniswapV2Router01(exchange).swapExactTokensForTokens(
            message.amount,
            0,
            path,
            message.user,
            block.timestamp + 600000 // 10 minutes
        );

        // step 4: reward executor
        // -> gas tank send a certain amount of ETH from the user balance to the treasury (still in gas tank?)
        // -> gas tank reward msg.sender with some freshly minted Brg tokens
        // -> end
    }

    function giveAllowance(IERC20 _token, address _exchange) private {
        IERC20(_token).approve(
            _exchange,
            0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        );
        allowances[_exchange][_token] = true;
    }
}
