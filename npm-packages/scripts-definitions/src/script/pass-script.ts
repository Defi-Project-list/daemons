import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, ethers } from "ethers";
import { BaseScript } from "./base-script";
import { BalanceFactory } from "../condition-base-factories/balance-factory";
import { FrequencyFactory } from "../condition-base-factories/frequency-factory";
import { PriceFactory } from "../condition-base-factories/price-factory";
import { RepetitionsFactory } from "../condition-base-factories/repetitions-factory";
import { FollowFactory } from "../condition-base-factories/follow-factory";
import { IPassAction } from "@daemons-fi/shared-definitions/build";
import { passScriptABI } from "@daemons-fi/contracts";
import { HealthFactorFactory } from "../condition-base-factories/health-factor-factory";

export class PassScript extends BaseScript {
    public constructor(
        private readonly message: IPassAction,
        signature: string,
        private readonly description: string
    ) {
        super(signature);
    }

    public readonly ScriptType = "PassScript";
    public getExecutorAddress = () => this.message.executor;
    public getExecutorAbi = () => passScriptABI;
    public getMessage = () => this.message;
    public getId = () => this.message.scriptId;
    public getUser = () => this.message.user;
    public getDescription = () => this.description;
    protected getAmount = () => BigNumber.from(0);
    protected getTokenForAllowance = () => "0x0";

    // Override parent hasAllowance, as it is never needed for this action.
    public async hasAllowance(
        signerOrProvider: ethers.providers.Provider | ethers.Signer
    ): Promise<boolean> {
        return Promise.resolve(true);
    }

    // Override parent requestAllowance, as it is never needed for this action.
    public async requestAllowance(signer: ethers.Signer): Promise<TransactionResponse> {
        throw new Error("Allowance should not be requested for Pass action");
    }

    public static async fromStorageJson(object: any) {
        const message: IPassAction = JSON.parse(JSON.stringify(object));

        // complex objects are broken down and need to be recreated. Sigh.
        message.chainId = BigNumber.from(object.chainId);
        message.tip = BigNumber.from(object.tip);

        message.balance = BalanceFactory.fromJson(message.balance);
        message.frequency = FrequencyFactory.fromJson(message.frequency);
        message.price = PriceFactory.fromJson(message.price);
        message.repetitions = RepetitionsFactory.fromJson(message.repetitions);
        message.follow = FollowFactory.fromJson(object.follow);
        message.healthFactor = HealthFactorFactory.fromJson(object.healthFactor);

        return new PassScript(message, object.signature, object.description);
    }
}
