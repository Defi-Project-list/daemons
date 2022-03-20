// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./ConditionsChecker.sol";
import "./Messages.sol";
import "./interfaces/UniswapV2.sol";

contract SwapperScriptExecutor is ConditionsChecker {
    uint256 public GAS_COST = 300000000000000; // 0.00030 ETH
    address private exchange;
    mapping(address => mapping(IERC20 => bool)) private allowances;

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setExchange(address _exchange) external onlyOwner {
        exchange = _exchange;
    }

    /* ========== HASH FUNCTIONS ========== */

    function hash(Swap calldata swap) private pure returns (bytes32) {
        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("Daemons-Swap-v01"))
            )
        );

        bytes32 swapHash = keccak256(
            bytes.concat(
                abi.encode(
                    SWAP_TYPEHASH,
                    swap.scriptId,
                    swap.tokenFrom,
                    swap.tokenTo,
                    swap.typeAmt,
                    swap.amount,
                    swap.user,
                    swap.executor,
                    swap.chainId
                ),
                abi.encodePacked(
                    hashBalance(swap.balance),
                    hashFrequency(swap.frequency),
                    hashPrice(swap.price),
                    hashRepetitions(swap.repetitions),
                    hashFollow(swap.follow)
                )
            )
        );

        return
            keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, swapHash));
    }

    /* ========== VERIFICATION FUNCTIONS ========== */

    function verifySignature(
        Swap calldata message,
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
        Swap calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public view {
        verifyRevocation(message.user, message.scriptId);
        verifySignature(message, r, s, v);

        // the minimum amount in order to have the transfer going through.
        // if typeAmt==Absolute -> it's the amount in the message,
        // otherwise it's enough if the user has more than 0 in the wallet.
        uint256 minAmount = message.typeAmt == 0 ? message.amount - 1 : 0;
        require(
            ERC20(message.tokenFrom).balanceOf(message.user) > minAmount,
            "User doesn't have enough balance"
        );

        verifyRepetitions(message.repetitions, message.scriptId);
        verifyFollow(message.follow, message.scriptId);
        verifyFrequency(message.frequency, message.scriptId);
        verifyBalance(message.balance, message.user);
        verifyPrice(message.price);
        verifyGasTank(message.user);
        verifyAllowance(message.user, message.tokenFrom, minAmount);
    }

    /* ========== EXECUTION FUNCTIONS ========== */

    function execute(
        Swap calldata message,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) external {
        verify(message, r, s, v);
        require(exchange != address(0), "Exchange address has not been set");
        lastExecutions[message.scriptId] = block.timestamp;
        repetitionsCount[message.scriptId] += 1;

        // step 0 get the tokens from the user
        IERC20 tokenFrom = IERC20(message.tokenFrom);
        uint256 amount = message.typeAmt == 0 // absolute type: just return the given amount
            ? message.amount // percentage type: the amount represents a percentage on 10000
            : (tokenFrom.balanceOf(message.user) * message.amount) / 10000;
        tokenFrom.transferFrom(message.user, address(this), amount);

        // step 1: get the path
        address[] memory path = new address[](2);
        path[0] = message.tokenFrom;
        path[1] = message.tokenTo;

        // step 2: grant allowance to the router if it has not been given yet
        if (!allowances[exchange][tokenFrom])
            giveAllowance(tokenFrom, exchange);

        // step 3: swap
        IUniswapV2Router01(exchange).swapExactTokensForTokens(
            amount,
            0,
            path,
            message.user,
            block.timestamp + 600000 // 10 minutes
        );

        // step 4: reward executor
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
}
