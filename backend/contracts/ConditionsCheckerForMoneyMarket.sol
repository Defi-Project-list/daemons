// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ConditionsChecker.sol";
import "./interfaces/IMoneyMarket.sol";

abstract contract ConditionsCheckerForMoneyMarket {


    /* ========== HASH FUNCTIONS ========== */

    /** Returns the hashed version of the balance */
    function hashHealthFactor(HealthFactor calldata healthFactor)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    HEALTH_FACTOR_TYPEHASH,
                    healthFactor.enabled,
                    healthFactor.kontract,
                    healthFactor.comparison,
                    healthFactor.amount
                )
            );
    }

    /* ========== VERIFICATION FUNCTIONS ========== */

    /** If the healthFactor condition is enabled, it checks the user HF for the given MM contract */
    function verifyHealthFactor(HealthFactor calldata healthFactor, address user)
        internal
        view
    {
        if (!healthFactor.enabled) return;
        (,,,,,uint256 currentHF) = IMoneyMarket(healthFactor.kontract).getUserAccountData(user);

        if (healthFactor.comparison == 0x00)
            // greater than
            require(
                currentHF > healthFactor.amount,
                "[HealthFactor Condition] HF lower than threshold"
            );
        else if (healthFactor.comparison == 0x01)
            // less than
            require(
                currentHF < healthFactor.amount,
                "[HealthFactor Condition] HF higher than threshold"
            );
    }
}
