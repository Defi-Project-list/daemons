import { BigNumber, ethers } from "ethers";
import { BaseScript } from "./base-script";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BalanceFactory } from "../condition-base-factories/balance-factory";
import { FrequencyFactory } from "../condition-base-factories/frequency-factory";
import { PriceFactory } from "../condition-base-factories/price-factory";
import { RepetitionsFactory } from "../condition-base-factories/repetitions-factory";
import { FollowFactory } from "../condition-base-factories/follow-factory";
import { IZapInAction } from "@daemons-fi/shared-definitions/build";
import { UniswapV2PairABI, zapInScriptABI } from "@daemons-fi/contracts";
import { AllowanceHelper } from "../allowance-helper";

export class ZapInScript extends BaseScript {
    public constructor(
        private readonly message: IZapInAction,
        signature: string,
        private readonly description: string
    ) {
        super(signature);
    }

    public readonly ScriptType = "ZapInScript";
    public getExecutorAddress = () => this.message.executor;
    public getExecutorAbi = () => zapInScriptABI;
    public getMessage = () => this.message;
    public getId = () => this.message.scriptId;
    public getUser = () => this.message.user;
    public getDescription = () => this.description;
    protected getAmount = () => {
        throw new Error("This method should not be used");
    };
    protected getTokenForAllowance = () => {
        throw new Error("This method should not be used");
    };

    public static async fromStorageJson(object: any) {
        const message: IZapInAction = JSON.parse(JSON.stringify(object));

        // complex objects are broken down and need to be recreated. Sigh.
        message.chainId = BigNumber.from(object.chainId);
        message.amountA = BigNumber.from(object.amountA);
        message.amountB = BigNumber.from(object.amountB);
        message.tip = BigNumber.from(object.tip);

        message.balance = BalanceFactory.fromJson(message.balance);
        message.frequency = FrequencyFactory.fromJson(message.frequency);
        message.price = PriceFactory.fromJson(message.price);
        message.repetitions = RepetitionsFactory.fromJson(message.repetitions);
        message.follow = FollowFactory.fromJson(object.follow);

        return new ZapInScript(message, object.signature, object.description);
    }

    // Override parent hasAllowance, as we need to grant it to two tokens
    public async hasAllowance(
        signerOrProvider: ethers.providers.Provider | ethers.Signer
    ): Promise<boolean> {
        const tokenA = await this.getTokenA(signerOrProvider);
        const tokenB = await this.getTokenB(signerOrProvider);

        const allowanceTokenA = await this.checkAllowanceForSingleToken(
            signerOrProvider,
            tokenA,
            this.message.amountA
        );

        const allowanceTokenB = await this.checkAllowanceForSingleToken(
            signerOrProvider,
            tokenB,
            this.message.amountB
        );

        return allowanceTokenA && allowanceTokenB;
    }

    private async checkAllowanceForSingleToken(
        signerOrProvider: ethers.providers.Provider | ethers.Signer,
        tokenAddress: string,
        tokenAmount: BigNumber
    ): Promise<boolean> {
        return await AllowanceHelper.checkForERC20Allowance(
            this.getUser(),
            tokenAddress,
            this.getExecutorAddress(),
            tokenAmount,
            signerOrProvider
        );
    }

    // Override parent hasAllowance, as we need to grant it to two tokens
    public async requestAllowance(signer: ethers.Signer): Promise<TransactionResponse> {
        const tokenA = await this.getTokenA(signer);
        const tokenB = await this.getTokenB(signer);

        const allowanceTokenA = await this.checkAllowanceForSingleToken(
            signer,
            tokenA,
            this.message.amountA
        );
        const allowanceTokenB = await this.checkAllowanceForSingleToken(
            signer,
            tokenB,
            this.message.amountB
        );

        const txA = !allowanceTokenA
            ? await AllowanceHelper.requestERC20Allowance(tokenA, this.getExecutorAddress(), signer)
            : undefined;
        const txB = !allowanceTokenB
            ? await AllowanceHelper.requestERC20Allowance(tokenB, this.getExecutorAddress(), signer)
            : undefined;

        return txB ?? txA!;
    }

    private tokenA?: string;
    private async getTokenA(
        signerOrProvider: ethers.providers.Provider | ethers.Signer
    ): Promise<string> {
        if (!this.tokenA) {
            const pair = new ethers.Contract(this.message.pair, UniswapV2PairABI, signerOrProvider);
            this.tokenA = (await pair.token0()) as string;
        }
        return this.tokenA;
    }

    private tokenB?: string;
    private async getTokenB(
        signerOrProvider: ethers.providers.Provider | ethers.Signer
    ): Promise<string> {
        if (!this.tokenB) {
            const pair = new ethers.Contract(this.message.pair, UniswapV2PairABI, signerOrProvider);
            this.tokenB = (await pair.token1()) as string;
        }
        return this.tokenB;
    }
}
