import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { DaemonsContracts, getContract } from "../daemons-contracts";

export const createLP = async (
    contracts: DaemonsContracts,
    owner: SignerWithAddress
): Promise<void> => {
    console.log("Creating LP");

    const treasury = await getContract(contracts, "Treasury");

    // send some ETH and initialize the LP
    const OneEth = ethers.utils.parseEther("1.0");
    await owner.sendTransaction({ to: treasury.address, value: OneEth });
    await treasury.createLP();

    // check the treasury state is finally valid
    await treasury.preliminaryCheck();

    console.log(`LP created`);
};
