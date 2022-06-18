import { DaemonsContracts, getContract, getContractAddress } from "../daemons-contracts";

export const initializeBeefyExecutor = async (contracts: DaemonsContracts): Promise<void> => {
    console.log("Updating Beefy Executor");

    const gasTankAddress = getContractAddress(contracts, "GasTank");
    const priceRetrieverAddress = getContractAddress(contracts, "PriceRetriever");
    const gasPriceFeedAddress = getContractAddress(contracts, "GasPriceFeed");

    const executor = await getContract(contracts, "BeefyScriptExecutor");
    await executor.setGasTank(gasTankAddress);
    await executor.setPriceRetriever(priceRetrieverAddress);
    await executor.setGasFeed(gasPriceFeedAddress);

    // final checks
    await executor.preliminaryCheck();
    console.log(`Beefy Executor updated`);
};
