import { conditionsCheckerABI } from "@daemons-fi/contracts/build";
import { BigNumber, ethers } from "ethers";

export class GasLimitFetcher {
    public static async getGasLimit(
        executorAddress: string,
        signerOrProvider: ethers.providers.Provider | ethers.Signer
    ): Promise<BigNumber> {
        const contract = new ethers.Contract(
            executorAddress,
            conditionsCheckerABI,
            signerOrProvider
        );

        return await contract.GAS_LIMIT();
    }
}
