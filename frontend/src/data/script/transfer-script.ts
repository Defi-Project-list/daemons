import { BigNumber, Contract } from 'ethers';
import { ITransferAction } from '../../../../messages/definitions/transfer-action-messages';
import { getAbiFor } from '../../utils/get-abi';
import { BaseScript } from './base-script';
import { Token } from '../tokens';

export class TransferScript extends BaseScript {
    public constructor(private readonly message: ITransferAction, signature: string, private readonly description: string) {
        super(signature);
    }

    public readonly ScriptType = "TransferScript";
    public getMessage = () => this.message;
    public getUser = () => this.message.user;
    public getId = () => this.message.scriptId;
    public getDescription = () => this.description;
    public getExecutorAddress = () => this.message.executor;
    protected getAmount = () => this.message.amount;
    protected getToken = () => this.message.token;

    public async getExecutor(): Promise<Contract> {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = this.message.executor;
        const contractAbi = await getAbiFor('TransferScriptExecutor');
        return new ethers.Contract(contractAddress, contractAbi, signer);
    }

    public static getDefaultDescription(message: ITransferAction, tokens: Token[]): string {
        const token = tokens.filter(t => t.address === message.token)[0]?.symbol ?? message.token;
        return `Transfer ${token} to ${message.destination.substring(0, 8) + "..."}`;
    }

    public static async fromStorageJson(object: any) {
        const message: ITransferAction = object;

        // complex objects are broken down and need to be recreated. Sigh.
        message.chainId = BigNumber.from(object.chainId);
        message.amount = BigNumber.from(object.amount);
        message.balance.amount = BigNumber.from(object.balance.amount);
        message.price.value = BigNumber.from(object.price.value);
        message.frequency.delay = BigNumber.from(object.frequency.delay);
        message.frequency.start = BigNumber.from(object.frequency.start);
        message.repetitions.amount = BigNumber.from(object.repetitions?.amount);
        message.follow.shift = BigNumber.from(object.follow.shift);

        return new TransferScript(message, object.signature, object.description);
    }
}
