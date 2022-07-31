import { DaemonsContracts, getContract, updateContracts } from "../daemons-contracts";

export const retrieveLPAddress = async (contracts: DaemonsContracts): Promise<DaemonsContracts> => {
    console.log(`Retrieving LP address`);
    const treasury = await getContract(contracts, "Treasury");
    const LPaddress = await treasury.polLp();
    return updateContracts(contracts, "wethDaemLp", LPaddress);
};
