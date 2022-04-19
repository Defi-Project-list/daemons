import { BigNumber, Contract, Signer } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { getAbiFor } from './get-abi';


export class AllowanceHelper {

    private readonly ethers: any;
    private readonly signer: Signer;
    // private readonly cachedValues: { [key: string]: BigNumber; } = {};

    public constructor() {
        this.ethers = require('ethers');
        const provider = new this.ethers.providers.Web3Provider((window as any).ethereum);
        this.signer = provider.getSigner();
    }

    public async checkForAllowance(
        userAddress: string,
        tokenAddress: string,
        executorAddress: string,
        amount: BigNumber): Promise<boolean> {
        //if (this.cachedValues[`${tokenAddress}${executorAddress}`]) return true;

        const tokenContract = await this.getTokenContract(tokenAddress);
        const allowance: BigNumber = await tokenContract.allowance(userAddress, executorAddress);
        return allowance.gte(amount);
    }

    public async requestAllowance(
        tokenAddress: string,
        executorAddress: string): Promise<TransactionResponse> {
        const tokenContract = await this.getTokenContract(tokenAddress);
        const transaction: TransactionResponse = await tokenContract.approve(executorAddress, BigNumber.from('0xffffffffffffffffffffffff'));
        return transaction;
    }

    private async getTokenContract(tokenAddress: string): Promise<Contract> {
        const contractAddress = tokenAddress;
        const contractAbi = await getAbiFor('ERC20');
        const token = new this.ethers.Contract(contractAddress, contractAbi, this.signer);
        return token;
    };
}
