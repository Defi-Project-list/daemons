import { ethers } from "ethers";
import { bigNumberToFloat, gasTankABI } from "@daemons-fi/contracts";
import { ChainInfo } from "./supported-chains";

export const claimFunds = async (chainId: string, signer: ethers.Signer): Promise<number> => {
    // fetch chain info
    const chain = ChainInfo[chainId];
    if (!chain) throw new Error(`Chain ${chainId} is not supported!`);

    // get GasTank contract
    const GasTank = new ethers.Contract(chain.contracts.GasTank, gasTankABI, signer);

    // Claim DAEM
    const rawClaimable = await GasTank.claimable(signer.getAddress());
    const claimable = bigNumberToFloat(rawClaimable, 4);

    if (claimable > 0) {
        const tx = await GasTank.claimReward();
        await tx.wait();
    }

    return claimable;
};
