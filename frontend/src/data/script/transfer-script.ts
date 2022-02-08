import { BigNumber, Contract } from 'ethers';
import { ITransferAction } from '../../../../messages/definitions/transfer-action-messages';
import { getAbiFor } from '../../utils/get-abi';
import { BaseScript } from './base-script';
import { IToken, Token } from '../tokens';
import { StorageProxy } from '../storage-proxy';

export class TransferScript extends BaseScript {
    public constructor(private readonly message: ITransferAction, signature: string) {
        super(signature);
    }

    public readonly ScriptType = "TransferScript";
    public getMessage = () => this.message;
    public getUser = () => this.message.user;
    public getId = () => this.message.scriptId;
    public getDefaultDescription(tokens: Token[]): string {
        const token = tokens.filter(t => t.address === this.message.token)[0]?.symbol ?? this.message.token;
        return `Transfer ${token} to ${this.message.destination.substring(0, 8) + "..."}`;
    }

    public async getExecutor(): Promise<Contract> {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = this.message.executor;
        const contractAbi = await getAbiFor('TransferScriptExecutor');
        return new ethers.Contract(contractAddress, contractAbi, signer);
    }
    public getExecutorAddress = () => this.message.executor;

    public static async fromStorageJson(object: any) {
        const message: ITransferAction = object;

        // complex objects are broken down and need to be recreated. Sigh.
        message.chainId = BigNumber.from(object.chainId);
        message.amount = BigNumber.from(object.amount);
        message.balance.amount = BigNumber.from(object.balance.amount);
        message.price.value = BigNumber.from(object.price.value);
        message.frequency.blocks = BigNumber.from(object.frequency.blocks);
        message.frequency.startBlock = BigNumber.from(object.frequency.startBlock);
        message.repetitions.amount = BigNumber.from(object.repetitions?.amount);
        message.follow.shift = BigNumber.from(object.follow.shift);

        return new TransferScript(message, object.signature);
    }
}
