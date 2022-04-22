import { BigNumber, ethers } from 'ethers';
import { Contract } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { AllowanceHelper } from '../../utils/allowance-helper';
import { StorageProxy } from '../storage-proxy';

export enum VerificationState {
    unverified = 'unverified',             // the script verification state has not been checked yet
    loading = 'loading',                   // script is currently  being verified
    allowanceNeeded = 'allowanceNeeded',   // the user needs to grant allowance
    maxReached = 'maxReached',             // the maximum number of executions has been reached
    invalidSignature = 'invalidSignature', // the script signature cannot be verified by the contract
    valid = 'valid',                       // the script can be executed
    noBalance = 'noBalance',               // the user does not have enough tokens to execute the script
    gasTankEmpty = 'gasTankEmpty',         // the user's gas tank is empty
    cannotBeRunYet = 'cannotBeRunYet',     // the frequency condition is not satisfied
    otherReason = 'otherReason',           // the script cannot be executed due to other reasons
}

export abstract class BaseScript {

    private readonly R: string;
    private readonly S: string;
    private readonly V: number;
    private verificationState: VerificationState;

    protected constructor(protected readonly signature: string) {
        const split = ethers.utils.splitSignature(signature);
        [this.R, this.S, this.V] = [split.r, split.s, split.v];
        this.verificationState = VerificationState.unverified;
    }

    public getVerificationState = (): VerificationState => this.verificationState;

    public async verify(): Promise<VerificationState> {
        const executor = await this.getExecutor();
        const message = this.getMessage();
        try {
            this.verificationState = VerificationState.loading;
            await executor.verify(message, this.R, this.S, this.V);
            this.verificationState = VerificationState.valid;
        } catch (error: any) {
            // something strange happened
            if (!error.data) throw error;

            // we can extract the verification failure reason
            this.verificationState = this.parseVerificationStateFromErrorText(error.data);
        }
        return this.verificationState;
    }

    public async execute(): Promise<TransactionResponse | undefined> {
        const executor = await this.getExecutor();
        const message = this.getMessage();
        try {
            return await executor.execute(message, this.R, this.S, this.V);
        } catch (error: any) {
            if (!error.data) throw error;

            // we can extract the verification failure reason
            alert(this.parseVerificationStateFromErrorText(error.data));
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
        return await allowanceHelper.checkForAllowance(
            this.getUser(),
            this.getTokenForAllowance(),
            this.getExecutorAddress(),
            this.getAmount());
    }

    public async requestAllowance(): Promise<void> {
        const allowanceHelper = new AllowanceHelper();

        // add "are you sure you want to leave" message
        window.onbeforeunload = () => true;
        const tx = await allowanceHelper.requestAllowance(this.getTokenForAllowance(), this.getExecutorAddress());
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

    private parseVerificationStateFromErrorText(errorText: string): VerificationState {
        const parsedErrorText = this.parseFailedVerifyError(errorText).toLowerCase();
        console.log(parsedErrorText);
        if (parsedErrorText.includes('signature')) return VerificationState.invalidSignature;
        if (parsedErrorText.includes('allowance')) return VerificationState.allowanceNeeded;
        if (parsedErrorText.includes('maximum number of executions')) return VerificationState.maxReached;
        if (parsedErrorText.includes('not enough gas in the tank')) return VerificationState.gasTankEmpty;
        if (parsedErrorText.includes('enough balance')) return VerificationState.noBalance;
        if (parsedErrorText.includes('[frequency condition]')) return VerificationState.cannotBeRunYet;

        return VerificationState.otherReason;
    }

    private parseFailedVerifyError(errorText: string): string {
        const hex = "0x" + errorText.substring(147);
        const withoutTrailing0s = hex.replace(/0*$/g, '');
        return ethers.utils.toUtf8String(withoutTrailing0s);
    }
}
