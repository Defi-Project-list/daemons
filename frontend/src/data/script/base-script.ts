import { BigNumber, ethers } from 'ethers';
import { Contract } from 'ethers';

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
        let tx: any;
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
        throw new Error("Not implemented yet");
    }

    public abstract readonly ScriptType: string;
    protected abstract getExecutor(): Promise<Contract>;
    public abstract getMessage(): any;
    public abstract getUser(): string;
    public abstract getId(): string;
    public abstract getDescription(): string;

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
