import { ContractInterface, ethers } from "ethers";
import { Contract } from "ethers";

export abstract class BaseScript {
  private readonly R: string;
  private readonly S: string;
  private readonly V: number;

  protected constructor(protected readonly signature: string) {
    const split = ethers.utils.splitSignature(signature);
    [this.R, this.S, this.V] = [split.r, split.s, split.v];
  }

  public async verify(provider: ethers.providers.Provider): Promise<string|undefined> {
    const executor = await this.getExecutor(provider);
    const message = this.getMessage();
    try {
      await executor.verify(message, this.R, this.S, this.V);
    } catch (error: any) {
      // something strange happened
      if (!error.data) return JSON.stringify(error);

      // we can extract the verification failure reason
      const errorText = error.data;
      return this.parseFailedVerifyError(errorText);
    }
  }

  public abstract readonly ScriptType: string;
  public abstract getExecutorAddress(): string;
  public abstract getExecutorAbi(): ContractInterface;
  public abstract getMessage(): any;
  public abstract getId(): string;
  public abstract getUser(): string;
  public abstract getDescription(): string;
  public getShortId = (): string => this.getId().substring(0, 7) + "..";

  public async getExecutor(
    provider: ethers.providers.Provider
  ): Promise<Contract> {
    const contractAddress = this.getExecutorAddress();
    const contractAbi = this.getExecutorAbi();
    return new ethers.Contract(contractAddress, contractAbi, provider);
  }

  private parseFailedVerifyError(errorText: string): string {
    const hex = "0x" + errorText.substring(147);
    const withoutTrailing0s = hex.replace(/0*$/g, "");
    return ethers.utils.toUtf8String(withoutTrailing0s);
  }
}
