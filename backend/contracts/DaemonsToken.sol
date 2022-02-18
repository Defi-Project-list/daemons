// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DaemonsToken is ERC20, Ownable {
    uint256 public MAX_SUPPLY = 10**27; // 1 Billion

    address private treasury;
    address private vestingContract;

    constructor() ERC20("Daemons", "DAEM") {}

    /**
     * Mints the whole supply of tokens.
     * A part will go to the owner, that will deposit it in the vesting contract,
     * the remaining part will go to the treasury, that will slowly release to
     * the public.
     */
    function initialize(address _treasury, address _vesting) public onlyOwner {
        require(treasury == address(0), "Can only initialize once");
        require(_treasury != address(0), "Invalid treasury address");
        require(_vesting != address(0), "Invalid vesting address");

        treasury = _treasury;
        vestingContract = _vesting;

        uint256 distributionAmount = (MAX_SUPPLY * 75) / 100;
        _mint(treasury, distributionAmount);

        uint256 vestingAmount = (MAX_SUPPLY * 25) / 100;
        _mint(_msgSender(), vestingAmount);
    }

    /**
     * The current circulating supply, given by the max supply, minus
     * the amount stored in the treasury and the vesting contract,
     * as they are not accessible to anyone and will be slowly released.
     */
    function circulatingSupply() public view returns (uint256) {
        return totalSupply() - balanceOf(treasury) - balanceOf(vestingContract);
    }
}
