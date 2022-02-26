// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./Messages.sol";
import "./interfaces/IGasTank.sol";
import "./interfaces/IPriceRetriever.sol";
import "./GasPriceFeed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ConditionsChecker is Ownable {
    mapping(bytes32 => uint256) internal lastExecutions;
    mapping(bytes32 => uint32) internal repetitionsCount;
    mapping(address => mapping(bytes32 => bool)) private revocations;

    uint256 internal chainId;
    IGasTank internal gasTank;
    GasPriceFeed internal gasPriceFeed;
    IPriceRetriever private priceRetriever;
    uint256 public MINIMUM_GAS_FOR_SCRIPT_EXECUTION = 0.5 ether;

    // domain definition
    string private constant EIP712_DOMAIN = "EIP712Domain(string name)";
    bytes32 internal constant EIP712_DOMAIN_TYPEHASH =
        keccak256(abi.encodePacked(EIP712_DOMAIN));

    // events
    event Executed(bytes32 id, uint256 cost);

    /* ========== CONSTRUCTOR ========== */

    constructor() {
        uint256 id;
        assembly {
            id := chainid()
        }
        chainId = id;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setGasTank(address _gasTank) external onlyOwner {
        require(_gasTank != address(0));
        gasTank = IGasTank(_gasTank);
    }

    function setPriceRetriever(address _priceRetriever) external onlyOwner {
        require(_priceRetriever != address(0));
        priceRetriever = IPriceRetriever(_priceRetriever);
    }

    function setGasFeed(address _gasPriceFeed) external onlyOwner {
        require(_gasPriceFeed != address(0));
        gasPriceFeed = GasPriceFeed(_gasPriceFeed);
    }

    function setMinimumGas(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        MINIMUM_GAS_FOR_SCRIPT_EXECUTION = _amount;
    }

    /** Checks whether the contract is ready to operate */
    function preliminaryCheck() external view {
        require(address(gasTank) != address(0), "GasTank");
        require(address(priceRetriever) != address(0), "PricesRetriever");
        require(address(gasPriceFeed) != address(0), "GasPriceFeed");
    }

    /* ========== PUBLIC FUNCTIONS ========== */

    function revoke(bytes32 _id) external {
        revocations[msg.sender][_id] = true;
    }

    function getRepetitions(bytes32 _id) external view returns (uint32) {
        return repetitionsCount[_id];
    }

    /* ========== HASH FUNCTIONS ========== */

    /** Returns the hashed version of the balance */
    function hashBalance(Balance calldata balance)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    BALANCE_TYPEHASH,
                    balance.enabled,
                    balance.token,
                    balance.comparison,
                    balance.amount
                )
            );
    }

    /** Returns the hashed version of the price condition */
    function hashPrice(Price calldata price) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    PRICE_TYPEHASH,
                    price.enabled,
                    price.token,
                    price.comparison,
                    price.value
                )
            );
    }

    /** Returns the hashed version of the frequency */
    function hashFrequency(Frequency calldata frequency)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    FREQUENCY_TYPEHASH,
                    frequency.enabled,
                    frequency.delay,
                    frequency.start
                )
            );
    }

    /** Returns the hashed version of the repetitions */
    function hashRepetitions(Repetitions calldata repetitions)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    REPETITIONS_TYPEHASH,
                    repetitions.enabled,
                    repetitions.amount
                )
            );
    }

    /** Returns the hashed version of the follow condition */
    function hashFollow(Follow calldata follow)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    FOLLOW_TYPEHASH,
                    follow.enabled,
                    follow.shift,
                    follow.scriptId,
                    follow.executor
                )
            );
    }

    /* ========== VERIFICATION FUNCTIONS ========== */

    /** Checks whether the user has revoked the script execution */
    function verifyRevocation(address user, bytes32 id) public view {
        require(!revocations[user][id], "Script has been revoked by the user");
    }

    /** Checks whether the user has enough funds in the GasTank to cover a script execution */
    function verifyGasTank(address user) public view {
        require(
            gasTank.balanceOf(user) >= MINIMUM_GAS_FOR_SCRIPT_EXECUTION,
            "[Gas Condition] Not enough gas in the tank"
        );
    }

    /** If the balance condition is enabled, it checks the user balance for it */
    function verifyBalance(Balance calldata balance, address user)
        internal
        view
    {
        if (!balance.enabled) return;

        ERC20 token = ERC20(balance.token);
        uint256 userBalance = token.balanceOf(user);

        if (balance.comparison == 0x00)
            // greater than
            require(
                userBalance > balance.amount,
                "[Balance Condition] User does not own enough tokens"
            );
        else if (balance.comparison == 0x01)
            // less than
            require(
                userBalance < balance.amount,
                "[Balance Condition] User owns too many tokens"
            );
    }

    /** If the price condition is enabled, it checks the token price for it */
    function verifyPrice(Price calldata price) internal view {
        if (!price.enabled) return;

        uint256 tokenPrice = priceRetriever.priceOf(price.token);

        if (price.comparison == 0x00)
            // greater than
            require(
                tokenPrice > price.value,
                "[Price Condition] Token price is lower than expected value"
            );
        else if (price.comparison == 0x01)
            // less than
            require(
                tokenPrice < price.value,
                "[Price Condition] Token price is higher than expected value"
            );
    }

    /** If the frequency condition is enabled, it checks whether enough blocks have been minted since the last execution */
    function verifyFrequency(Frequency calldata frequency, bytes32 id)
        internal
        view
    {
        if (!frequency.enabled) return;

        if (lastExecutions[id] > 0) {
            // the message has already been executed at least once
            require(
                block.timestamp > lastExecutions[id] + frequency.delay,
                "[Frequency Condition] Not enough time has passed since the last execution"
            );
            return;
        }

        // the message has never been executed before
        require(
            block.timestamp > frequency.start + frequency.delay,
            "[Frequency Condition] Not enough time has passed since the start block"
        );
    }

    /** If the repetitions condition is enabled, it checks whether the script has reached its maximum number of executions */
    function verifyRepetitions(Repetitions calldata repetitions, bytes32 id)
        internal
        view
    {
        if (!repetitions.enabled) return;
        require(
            repetitionsCount[id] < repetitions.amount,
            "[Repetitions Condition] The script has reached its maximum number of executions"
        );
    }

    /** If the follow condition is enabled, it checks whether the script it's supposed to follow has been executed */
    function verifyFollow(Follow calldata follow, bytes32 id) internal view {
        if (!follow.enabled) return;
        uint32 parentCount = follow.executor == address(this)
            ? repetitionsCount[follow.scriptId]
            : ConditionsChecker(follow.executor).getRepetitions(
                follow.scriptId
            );
        require(
            parentCount > repetitionsCount[id] + follow.shift,
            "[Follow Condition] The parent script has not been (re)executed yet"
        );
    }

    /** Verifies that the user gave the allowance to the contract to move their tokens */
    function verifyAllowance(
        address user,
        address token,
        uint256 amount
    ) internal view {
        require(
            IERC20(token).allowance(user, address(this)) >= amount,
            "[Allowance Condition] User did not give enough allowance to the script executor"
        );
    }
}
