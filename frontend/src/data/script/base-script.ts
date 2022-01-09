import { ethers } from 'ethers';
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
        try {
            await executor.verify(message, this.R, this.S, this.V);
        } catch (error) {
            return String(error);
        }

        return "";
    }

    public async execute(): Promise<string> {
        const executor = await this.getExecutor();
        const message = this.getMessage();
        try {
            await executor.execute(message, this.R, this.S, this.V);
        } catch (error) {
            return String(error);
        }

        return "";
    }

    public async revoke(): Promise<void> {
        throw new Error("Not implemented yet");
    }

    protected abstract getExecutor(): Promise<Contract>;
    public abstract getMessage(): any;
    public abstract getUser(): string;
    public abstract getId(): string;
    public abstract getDescription(): string;

    public abstract toJsonString(): string;
}
