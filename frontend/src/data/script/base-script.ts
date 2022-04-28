import { BigNumber, ethers } from 'ethers';
import { Contract } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { AllowanceHelper } from '../../utils/allowance-helper';
import { StorageProxy } from '../storage-proxy';
import { ExecutingScript, LoadingVerificationScript, ScriptVerification, UnverifiedScript, ValidScript, VerificationFailedScript } from "./verification-result";


export abstract class BaseScript {

    private readonly R: string;
    private readonly S: string;
    private readonly V: number;
    private verification: ScriptVerification;

    protected constructor(protected readonly signature: string) {
        const split = ethers.utils.splitSignature(signature);
        [this.R, this.S, this.V] = [split.r, split.s, split.v];
        this.verification = new UnverifiedScript();
    }

    public getVerification = (): ScriptVerification => this.verification;

    public async verify(): Promise<ScriptVerification> {
        const executor = await this.getExecutor();
        const message = this.getMessage();
        try {
            this.verification = new LoadingVerificationScript();
            await executor.verify(message, this.R, this.S, this.V);
            this.verification = new ValidScript();
        } catch (error: any) {
            // something strange happened
            if (!error.data) throw error;

            // we can extract the verification failure reason
            this.verification = this.parseVerificationStateFromErrorText(error.data);
        }
        return this.verification;
    }

    public async execute(): Promise<TransactionResponse | undefined> {
        const executor = await this.getExecutor();
        const message = this.getMessage();
        try {
            this.verification = new ExecutingScript();
            return await executor.execute(message, this.R, this.S, this.V);
        } catch (error: any) {
            if (!error.data) throw error;

            // we can extract the verification failure reason
            this.verification = this.parseVerificationStateFromErrorText(error.data);
            alert((this.verification as VerificationFailedScript).getDescription());
        }
    }

    public async revoke(): Promise<void> {
        alert("Do not leave the site until tx is successful to be sure the script is removed");
        const executor = await this.getExecutor();
        try {
            // add "are you sure you want to leave" message
            window.onbeforeunload = () => true;
            const tx = await executor.revoke(this.getId());
            await tx.wait();
            await StorageProxy.script.revokeScript(this.getId());
            // remove "are you sure you want to leave" message
            window.onbeforeunload = null;
        } catch (error: any) {
            throw error;
        }
    }

    public async hasAllowance(): Promise<boolean> {
        const allowanceHelper = new AllowanceHelper();
        return await allowanceHelper.checkForERC20Allowance(
            this.getUser(),
            this.getTokenForAllowance(),
            this.getExecutorAddress(),
            this.getAmount());
    }

    public async requestAllowance(): Promise<void> {
        const allowanceHelper = new AllowanceHelper();

        // add "are you sure you want to leave" message
        window.onbeforeunload = () => true;
        const tx = await allowanceHelper.requestERC20Allowance(this.getTokenForAllowance(), this.getExecutorAddress());
        await tx.wait();
        // remove "are you sure you want to leave" message
        window.onbeforeunload = null;
    }

    public abstract readonly ScriptType: string;
    public abstract getExecutor(): Promise<Contract>;
    public abstract getExecutorAddress(): string;
    public abstract getMessage(): any;
    public abstract getUser(): string;
    public abstract getId(): string;
    public abstract getDescription(): string;
    protected abstract getAmount(): BigNumber;
    protected abstract getTokenForAllowance(): string;

    public toJson(): string {
        return {
            signature: this.signature,
            description: this.getDescription(),
            ...this.getMessage(),
        };
    }

    private parseVerificationStateFromErrorText(errorText: string): VerificationFailedScript {
        const parsedErrorText = this.parseFailedVerifyError(errorText);
        console.log(parsedErrorText);
        return new VerificationFailedScript(parsedErrorText);
    }

    private parseFailedVerifyError(errorText: string): string {
        const hex = "0x" + errorText.substring(147);
        const withoutTrailing0s = hex.replace(/0*$/g, '');
        return ethers.utils.toUtf8String(withoutTrailing0s);
    }
}
