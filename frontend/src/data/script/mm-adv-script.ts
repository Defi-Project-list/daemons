import { BigNumber, Contract } from "ethers";
import { getAbiFor } from "../../utils/get-abi";
import { BaseScript } from "./base-script";
import { BalanceConditionFactory } from "../../script-factories/conditions-factories/balance-condition-factory";
import { FollowConditionFactory } from "../../script-factories/conditions-factories/follow-condition-factory";
import { FrequencyConditionFactory } from "../../script-factories/conditions-factories/frequency-condition-factory";
import { PriceConditionFactory } from "../../script-factories/conditions-factories/price-condition-factory";
import { RepetitionsConditionFactory } from "../../script-factories/conditions-factories/repetitions-condition-factory";
import { HealthFactorConditionFactory } from "../../script-factories/conditions-factories/health-factor-condition-factory";
import { AdvancedMoneyMarketActionType } from "@daemons-fi/shared-definitions/build";
import { IMMAdvancedAction } from "@daemons-fi/shared-definitions/build";
import { AllowanceHelper } from "../../utils/allowance-helper";

export class MmAdvancedScript extends BaseScript {
    public constructor(
        private readonly message: IMMAdvancedAction,
        signature: string,
        private readonly description: string
    ) {
        super(signature);
    }

    public readonly ScriptType = "MmAdvancedScript";
    public getMessage = () => this.message;
    public getUser = () => this.message.user;
    public getId = () => this.message.scriptId;
    public getDescription = () => this.description;
    public getExecutorAddress = () => this.message.executor;
    protected getAmount = () => this.message.amount;
    protected getTokenForAllowance = () =>
        this.message.action === AdvancedMoneyMarketActionType.Repay
            ? this.message.token
            : this.message.debtToken;

    public async getExecutor(): Promise<Contract> {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();

        const contractAddress = this.message.executor;
        const contractAbi = await getAbiFor("MmAdvancedScriptExecutor");
        return new ethers.Contract(contractAddress, contractAbi, signer);
    }

    public static async fromStorageJson(object: any) {
        const message: IMMAdvancedAction = object;

        // complex objects are broken down and need to be recreated. Sigh.
        message.chainId = BigNumber.from(object.chainId);
        message.amount = BigNumber.from(object.amount);

        message.balance = BalanceConditionFactory.fromJson(message.balance);
        message.frequency = FrequencyConditionFactory.fromJson(message.frequency);
        message.price = PriceConditionFactory.fromJson(message.price);
        message.repetitions = RepetitionsConditionFactory.fromJson(message.repetitions);
        message.follow = FollowConditionFactory.fromJson(object.follow);
        message.healthFactor = HealthFactorConditionFactory.fromJson(object.healthFactor);

        return new MmAdvancedScript(message, object.signature, object.description);
    }

    // Override parent hasAllowance, ONLY for borrow,
    // as we need to use a different contract.
    public async hasAllowance(): Promise<boolean> {
        if (this.message.action === AdvancedMoneyMarketActionType.Repay) {
            return super.hasAllowance();
        }

        // if it is a BORROW message, we need to call checkForAAVEDebtTokenAllowance instead.
        const allowanceHelper = new AllowanceHelper();
        return await allowanceHelper.checkForAAVEDebtTokenAllowance(
            this.getUser(),
            this.getTokenForAllowance(),
            this.getExecutorAddress(),
            this.getAmount()
        );
    }

    // Override parent requestAllowance, ONLY for borrow,
    // as we need to use a different contract.
    public async requestAllowance(): Promise<void> {
        if (this.message.action === AdvancedMoneyMarketActionType.Repay) {
            return super.requestAllowance();
        }

        const allowanceHelper = new AllowanceHelper();

        // add "are you sure you want to leave" message
        window.onbeforeunload = () => true;
        // if it is a BORROW message, we need to call checkForAAVEDebtTokenAllowance instead.
        const tx = await allowanceHelper.requestAAVEDebtTokenAllowance(
            this.getTokenForAllowance(),
            this.getExecutorAddress()
        );
        await tx.wait();
        // remove "are you sure you want to leave" message
        window.onbeforeunload = null;
    }
}
