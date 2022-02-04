import { BigNumber, Contract } from 'ethers';
import { ISwapAction } from '../../../../messages/definitions/swap-action-messages';
import { ITransferAction } from '../../../../messages/definitions/transfer-action-messages';
import { getAbiFor } from '../../utils/get-abi';
import { StorageProxy } from '../storage-proxy';
import { BaseScript } from './base-script';
import { IToken } from '../tokens';

export class TransferScript extends BaseScript {
    private readonly tokens: IToken[];

    public static async build(message: ITransferAction, signature: string): Promise<TransferScript> {
        const tokens = await StorageProxy.fetchTokens(message.chainId.toString());
        return new TransferScript(message, signature, tokens);
    }

    private constructor(private readonly message: ITransferAction, signature: string, tokens: IToken[]) {
        super(signature);
        this.tokens = tokens;
    }

    public readonly ScriptType = "TransferScript";
    public getMessage = () => this.message;
    public getUser = () => this.message.user;
    public getId = () => this.message.scriptId;
    public getDescription(): string {
        const token = this.tokens.filter(t => t.address === this.message.token)[0];
        const amount = this.message.amount.div(BigNumber.from(10).pow(BigNumber.from(token.decimals - 2))).toNumber() / 100;
        return `Transfer ${amount} ${token.symbol} to ${this.message.destination.substr(0, 8) + "..."}`;
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

        return await TransferScript.build(message, object.signature);
    }
}
