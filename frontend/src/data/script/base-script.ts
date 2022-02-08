import { ethers } from 'ethers';
import { Contract } from 'ethers';
import { StorageProxy } from '../storage-proxy';
import { Token } from '../tokens';

export abstract class BaseScript {

    private readonly R: string;
    private readonly S: string;
    private readonly V: number;

    protected constructor(protected readonly signature: string) {
        const split = ethers.utils.splitSignature(signature);
        [this.R, this.S, this.V] = [split.r, split.s, split.v];
    }

    public async verify(): Promise<string> {
        const executor = await this.getExecutor();
        const message = this.getMessage();
        try {
            await executor.verify(message, this.R, this.S, this.V);
            return "Verified!";
        } catch (error: any) {
            if (error.data)
                return this.parseFailedVerifyError(error.data);

            throw error;
        }
    }

    public async execute(): Promise<string> {
        const executor = await this.getExecutor();
        const message = this.getMessage();
        await executor.execute(message, this.R, this.S, this.V);
        return "YAY!";
    }

    public async revoke(): Promise<void> {
        alert("Do not leave the site until tx is successful to be sure the script is removed");
        const executor = await this.getExecutor();
        try {
            // add "are you sure you want to leave" message
            window.onbeforeunload = () => true;
            const tx = await executor.revoke(this.getId());
            await tx.wait();
            await StorageProxy.revokeScript(this.getId(), this.ScriptType);
            // remove "are you sure you want to leave" message
            window.onbeforeunload = null;
        } catch (error: any) {
            throw error;
        }
    }

    public abstract readonly ScriptType: string;
    public abstract getExecutor(): Promise<Contract>;
    public abstract getExecutorAddress(): string;
    public abstract getMessage(): any;
    public abstract getUser(): string;
    public abstract getId(): string;
    public abstract getDefaultDescription(tokens: Token[]): string;

    public toJsonString(): string {
        return JSON.stringify({
            signature: this.signature,
            ...this.getMessage(),
        });
    }

    private parseFailedVerifyError(errorText: string): string {
        const hex = "0x" + errorText.substring(147);
        const withoutTrailing0s = hex.replace(/0*$/g, '');
        return ethers.utils.toUtf8String(withoutTrailing0s);
    }
}
