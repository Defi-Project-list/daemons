import { BigNumber, ethers } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { CreditDelegationTokenAbi, ERC20Abi } from "@daemons-fi/abis";

export class AllowanceHelper {
  // ERC-20

  public static async checkForERC20Allowance(
    userAddress: string,
    tokenAddress: string,
    executorAddress: string,
    amount: BigNumber,
    signerOrProvider: ethers.providers.Provider | ethers.Signer
  ): Promise<boolean> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20Abi,
      signerOrProvider
    );
    const allowance: BigNumber = await tokenContract.allowance(
      userAddress,
      executorAddress
    );
    return allowance.gte(amount);
  }

  public static async requestERC20Allowance(
    tokenAddress: string,
    executorAddress: string,
    signer: ethers.Signer
  ): Promise<TransactionResponse> {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, signer);
    const transaction: TransactionResponse = await tokenContract.approve(
      executorAddress,
      BigNumber.from("0xffffffffffffffffffffffff")
    );
    return transaction;
  }

  // AAVE DEBT TOKENS

  public static async checkForAAVEDebtTokenAllowance(
    userAddress: string,
    tokenAddress: string,
    executorAddress: string,
    amount: BigNumber,
    signerOrProvider: ethers.providers.Provider | ethers.Signer
  ): Promise<boolean> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      CreditDelegationTokenAbi,
      signerOrProvider
    );
    const allowance: BigNumber = await tokenContract.borrowAllowance(
      userAddress,
      executorAddress
    );
    return allowance.gte(amount);
  }

  public static async requestAAVEDebtTokenAllowance(
    tokenAddress: string,
    executorAddress: string,
    signer: ethers.Signer
  ): Promise<TransactionResponse> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      CreditDelegationTokenAbi,
      signer
    );
    const transaction: TransactionResponse =
      await tokenContract.approveDelegation(
        executorAddress,
        BigNumber.from("0xffffffffffffffffffffffff")
      );
    return transaction;
  }
}
