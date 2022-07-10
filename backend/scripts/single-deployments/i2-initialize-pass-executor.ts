import { DaemonsContracts, getContract, getContractAddress } from "../daemons-contracts";

export const initializePassExecutor = async (contracts: DaemonsContracts): Promise<void> => {
    console.log("Updating Pass Executor");

    const gasTankAddress = getContractAddress(contracts, "GasTank");
    const gasPriceFeedAddress = getContractAddress(contracts, "GasPriceFeed");

    const executor = await getContract(contracts, "PassScriptExecutor");
    await executor.setGasTank(gasTankAddress);
    await executor.setGasFeed(gasPriceFeedAddress);

    // final checks
    await executor.preliminaryCheck();
    console.log(`Pass Executor updated`);
};
