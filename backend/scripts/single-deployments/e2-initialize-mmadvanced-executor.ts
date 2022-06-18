import { DaemonsContracts, getContract, getContractAddress } from "../daemons-contracts";

export const initializeMmAdvancedExecutor = async (contracts: DaemonsContracts): Promise<void> => {
    console.log("Updating MmAdvanced Executor");

    const gasTankAddress = getContractAddress(contracts, "GasTank");
    const gasPriceFeedAddress = getContractAddress(contracts, "GasPriceFeed");
    const aavePriceOracleAddress = getContractAddress(contracts, "AavePriceOracle");

    const executor = await getContract(contracts, "MmAdvancedScriptExecutor");
    await executor.setGasTank(gasTankAddress);
    await executor.setGasFeed(gasPriceFeedAddress);
    await executor.setAavePriceOracle(aavePriceOracleAddress);

    // final checks
    await executor.preliminaryCheck();
    console.log(`MmAdvanced Executor updated`);
};
