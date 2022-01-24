import { BigNumber, Contract } from 'ethers';
import { ISwapAction } from '../../../../messages/definitions/swap-action-messages';
import { getAbiFor } from '../../utils/get-abi';
import { Tokens } from '../tokens';
import { BaseScript } from './base-script';


export class SwapScript extends BaseScript {
    public constructor(private readonly message: ISwapAction, signature: string) {
        super(signature);
    }

    public readonly ScriptType = "SwapScript";
    public getMessage = () => this.message;
    public getUser = () => this.message.user;
    public getId = () => this.message.scriptId;
    public getDescription(): string {
        const tokens = Tokens.Kovan;
        const tokenFrom = tokens.filter(t => t.address === this.message.tokenFrom)[0];
        const tokenTo = tokens.filter(t => t.address === this.message.tokenTo)[0];
        const amount = this.message.amount.div(BigNumber.from(10).pow(BigNumber.from(tokenFrom.decimals - 2))).toNumber() / 100;
        return `Swap ${amount} ${tokenFrom.symbol} for ${tokenTo.symbol}`;
    }

    protected async getExecutor(): Promise<Contract> {
        const ethers = require('ethers');
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = this.message.executor;
        const contractAbi = await getAbiFor('SwapperScriptExecutor');
        return new ethers.Contract(contractAddress, contractAbi, signer);
    }

    public static fromStorageJson(object: any) {
        const message: ISwapAction = object;

        // complex objects are broken down and need to be recreated. Sigh.
        message.chainId = BigNumber.from(object.chainId);
        message.amount = BigNumber.from(object.amount);
        message.balance.amount = BigNumber.from(object.balance.amount);
        message.price.value = BigNumber.from(object.price.value);
        message.frequency.blocks = BigNumber.from(object.frequency.blocks);
        message.frequency.startBlock = BigNumber.from(object.frequency.startBlock);
        message.repetitions.amount = BigNumber.from(object.repetitions.amount);

        return new SwapScript(message, object.signature);
    }
}
