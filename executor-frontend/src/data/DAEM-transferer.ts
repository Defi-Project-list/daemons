import { ethers } from "ethers";
import { bigNumberToFloat, DAEMTokenABI } from "@daemons-fi/contracts";
import { ChainInfo } from "./supported-chains";

export const transferAllDAEM = async (
    chainId: string,
    signer: ethers.Signer,
    destination: string
): Promise<number> => {
    // fetch chain info
    const chain = ChainInfo[chainId];
    if (!chain) throw new Error(`Chain ${chainId} is not supported!`);

    const DAEM = new ethers.Contract(chain.contracts.DaemonsToken, DAEMTokenABI, signer);

    const rawBalance = await DAEM.balanceOf(signer.getAddress());
    const balance = bigNumberToFloat(rawBalance, 4);

    const tx = await DAEM.transfer(destination, rawBalance);
    await tx.wait();
    return balance;
};
