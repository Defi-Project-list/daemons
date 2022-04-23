import { BigNumber, Contract, Signer } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { getAbiFor } from "./get-abi";

export class AllowanceHelper {
    private readonly ethers: any;
    private readonly signer: Signer;
    // private readonly cachedValues: { [key: string]: BigNumber; } = {};

    public constructor() {
        this.ethers = require("ethers");
        const provider = new this.ethers.providers.Web3Provider((window as any).ethereum);
        this.signer = provider.getSigner();
    }

    private async getTokenContract(
        tokenAddress: string,
        abiName: string = "ERC20"
    ): Promise<Contract> {
        const contractAbi = await getAbiFor(abiName);
        const token = new this.ethers.Contract(tokenAddress, contractAbi, this.signer);
        return token;
    }

    // ERC-20

    public async checkForERC20Allowance(
        userAddress: string,
        tokenAddress: string,
        executorAddress: string,
        amount: BigNumber
    ): Promise<boolean> {
        //if (this.cachedValues[`${tokenAddress}${executorAddress}`]) return true;

        const tokenContract = await this.getTokenContract(tokenAddress);
        const allowance: BigNumber = await tokenContract.allowance(userAddress, executorAddress);
        return allowance.gte(amount);
    }

    public async requestERC20Allowance(
        tokenAddress: string,
        executorAddress: string
    ): Promise<TransactionResponse> {
        const tokenContract = await this.getTokenContract(tokenAddress);
        const transaction: TransactionResponse = await tokenContract.approve(
            executorAddress,
            BigNumber.from("0xffffffffffffffffffffffff")
        );
        return transaction;
    }

    // AAVE DEBT TOKENS

    public async checkForAAVEDebtTokenAllowance(
        userAddress: string,
        tokenAddress: string,
        executorAddress: string,
        amount: BigNumber
    ): Promise<boolean> {
        //if (this.cachedValues[`${tokenAddress}${executorAddress}`]) return true;

        const tokenContract = await this.getTokenContract(tokenAddress, "ICreditDelegationToken");
        const allowance: BigNumber = await tokenContract.borrowAllowance(userAddress, executorAddress);
        return allowance.gte(amount);
    }

    public async requestAAVEDebtTokenAllowance(
        tokenAddress: string,
        executorAddress: string
    ): Promise<TransactionResponse> {
        const tokenContract = await this.getTokenContract(tokenAddress, "ICreditDelegationToken");
        const transaction: TransactionResponse = await tokenContract.approveDelegation(
            executorAddress,
            BigNumber.from("0xffffffffffffffffffffffff")
        );
        return transaction;
    }
}
