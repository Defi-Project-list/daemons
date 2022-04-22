// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/IAavePriceOracleGetter.sol";
import "./ConditionsChecker.sol";
import "./ConditionsCheckerForMoneyMarket.sol";
import "./Messages.sol";

contract MmAdvancedScriptExecutor is
    ConditionsChecker,
    ConditionsCheckerForMoneyMarket
{
    uint256 public GAS_COST = 325000000000000; // 0.000325 ETH
    mapping(address => mapping(IERC20 => bool)) private allowances;
    IPriceOracleGetter public priceOracle;

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setAavePriceOracle(address _priceOracle) external onlyOwner {
        require(_priceOracle != address(0));
        priceOracle = IPriceOracleGetter(_priceOracle);
    }

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
                    mm.debtToken,
                    mm.action,
                    mm.typeAmt,
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
                    hashFollow(mm.follow),
                    hashHealthFactor(mm.healthFactor)
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
        require(address(priceOracle) != address(0), "Price oracle not set");
        verifyRevocation(message.user, message.scriptId);
        verifySignature(message, r, s, v);
        verifyFollow(message.follow, message.scriptId);
        verifyRepetitions(message.repetitions, message.scriptId);
        verifyFrequency(message.frequency, message.scriptId);

        if (message.action == 0x00) {
            verifyAmountForRepay(message);
        } else {
            verifyAmountForBorrow(message);
        }

        verifyBalance(message.balance, message.user);
        verifyPrice(message.price);
        verifyGasTank(message.user);
        verifyAllowance(message.user, message.token, message.amount);
        verifyHealthFactor(message.healthFactor, message.user);
    }

    function verifyAmountForRepay(MmAdvanced calldata message) private view {
        uint256 amount = message.typeAmt == 0
            ? message.amount // absolute type: just return the given amount
            : (ERC20(message.debtToken).balanceOf(message.user) *
                message.amount) / 10000; // percentage type: a % on that token debt

        require(
            ERC20(message.token).balanceOf(message.user) >= amount,
            "Not enough balance to repay debt"
        );
    }

    function verifyAmountForBorrow(MmAdvanced calldata message) private view {
        if (message.typeAmt == 0x01) {
            // if user wants to borrow a percentage of their borrowing
            // power we're ok with it as long as it is <= 95% of it.
            require(message.amount <= 9500, "Borrow percentage too high");
            return;
        }

        uint256 assetPriceInEth = priceOracle.getAssetPrice(message.token);
        (, , uint256 borrowableEth, , , ) = IMoneyMarket(message.kontract)
            .getUserAccountData(message.user);
        uint256 borrowableTokens = (((borrowableEth * 95) / 100) *
            (10**ERC20(message.token).decimals())) / assetPriceInEth;

        require(
            message.amount <= borrowableTokens,
            "Amount higher than borrowable"
        );
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
        uint256 amount = message.typeAmt == 0
            ? message.amount // absolute type: just return the given amount
            : (ERC20(message.debtToken).balanceOf(message.user) *
                message.amount) / 10000; // percentage type: a % on that token debt

        // step 0 get the Tokens from the user
        IERC20 tokenFrom = IERC20(message.token);
        tokenFrom.transferFrom(message.user, address(this), amount);

        // step 1 grant allowance to the router if it has not been given yet
        if (!allowances[message.kontract][tokenFrom])
            giveAllowance(tokenFrom, message.kontract);

        // step 2 call repay function
        uint256 amountRepaid = IMoneyMarket(message.kontract).repay(
            message.token,
            amount,
            message.rateMode == 0x01 ? 1 : 2,
            message.user
        );

        // step 3 send back any leftover to the user
        uint256 amountDue = amount - amountRepaid;
        if (amountDue > 0) {
            IERC20(message.token).transfer(message.user, amountDue);
        }
    }

    function borrow(MmAdvanced calldata message) private {
        uint256 amount = message.amount;

        if (message.typeAmt == 0x01) {
            // if user wants to borrow a percentage of their borrowing
            // power we need to calculate it

            uint256 assetPriceInEth = priceOracle.getAssetPrice(message.token);
            (, , uint256 borrowableEth, , , ) = IMoneyMarket(message.kontract)
                .getUserAccountData(message.user);

            amount =
                (((borrowableEth * message.amount) / 10000) *
                    (10**ERC20(message.token).decimals())) /
                assetPriceInEth;
        }

        // step 1 call withdraw function
        // NOTE: amount is always absolute
        IMoneyMarket(message.kontract).borrow(
            message.token,
            amount,
            message.rateMode == 0x01 ? 1 : 2,
            0,
            message.user
        );

        // step 2 send borrowed tokens to user
        IERC20(message.token).transfer(message.user, amount);
    }
}
