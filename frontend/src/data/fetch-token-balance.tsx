import { ethers } from "ethers";
import { ERC20Abi } from "@daemons-fi/contracts";
import { bigNumberToFloat } from "@daemons-fi/contracts";

export const fetchTokenBalance = async (
    walletAddress: string,
    tokenAddress: string
): Promise<number> => {
    // Get ERC20 contract
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const token = new ethers.Contract(tokenAddress, ERC20Abi, provider);

    // get Balance and format
    const currentBalance = await token.balanceOf(walletAddress);
    return bigNumberToFloat(currentBalance);
};
