//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

interface IGasTank {
    /** Gets the amount of ETH the user has deposited in the gas tank */
    function balanceOf(address user) external view returns (uint256);

    /** Adds ETH to the gas tank */
    function deposit() external payable;

    /** Removes ETH to the gas tank */
    function withdraw(uint256 amount) external;

    /** Removes all ETH to the gas tank */
    function withdrawAll() external;

    /** Removes funds from the gas tank of a user,
     * in order to have them employed as payment for the execution of a script.
     * note: only executor contracts can call this function.
     */
    function addReward(
        uint256 amount,
        address user,
        address executor
    ) external;

    /** The amount of tokens that can be claimed as payment for an executor work */
    function claimable(address user) external view returns (uint256);

    /** Claims the token received as payment for an executor work */
    function claimReward() external;

    /** Immediately deposits the user's claimable amount into the treasury for staking purposes */
    function claimAndStakeReward() external;
}
