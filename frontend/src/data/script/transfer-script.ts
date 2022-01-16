import { BigNumber, Contract } from 'ethers';
import { ISwapAction } from '../../../../messages/definitions/swap-action-messages';
import { ITransferAction } from '../../../../messages/definitions/transfer-action-messages';
import { getAbiFor } from '../../utils/get-abi';
import { Tokens } from '../tokens';
import { BaseScript } from './base-script';


export class TransferScript extends BaseScript {
    public constructor(private readonly message: ITransferAction, signature: string) {
        super(signature);
    }

    public getMessage = () => this.message;
    public getUser = () => this.message.user;
    public getId = () => this.message.scriptId;
    public getDescription(): string {
        const tokens = Tokens.Kovan;
        const token = tokens.filter(t => t.address === this.message.token)[0];
        const amount = this.message.amount.div(BigNumber.from(10).pow(BigNumber.from(token.decimals - 2))).toNumber() / 100;
        return `Transfer ${amount} ${token.symbol} to ${this.message.destination.substr(0, 8) + "..."}`;
    }

    protected async getExecutor(): Promise<Contract> {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = this.message.executor;
        const contractAbi = await getAbiFor('TransferScriptExecutor');
        return new ethers.Contract(contractAddress, contractAbi, signer);
    }

    public toJsonString(): string {
        return JSON.stringify({
            signature: this.signature,
            message: this.message,
        });
    }

    public static fromJsonString(json: string) {
        const object: any = JSON.parse(json);
        const message: ISwapAction = object.message;

        // complex objects are broken down and need to be recreated. Sigh.
        message.chainId = BigNumber.from(object.message.chainId.hex);
        message.amount = BigNumber.from(object.message.amount.hex);
        message.balance.amount = BigNumber.from(object.message.balance.amount.hex);
        message.price.value = BigNumber.from(object.message.price.value.hex);

        return new TransferScript(object.message, object.signature);
    }
}
