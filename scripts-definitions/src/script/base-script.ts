import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, ContractInterface, ethers } from "ethers";
import { Contract } from "ethers";
import { AllowanceHelper } from "../allowance-helper";
import {
  ExecutingScript,
  LoadingVerificationScript,
  ScriptVerification,
  UnverifiedScript,
  ValidScript,
  VerificationFailedScript
} from "../verification-result";

export abstract class BaseScript {
  private verification: ScriptVerification;
  private readonly R: string;
  private readonly S: string;
  private readonly V: number;

  public abstract readonly ScriptType: string;
  public abstract getExecutorAddress(): string;
  public abstract getExecutorAbi(): ContractInterface;
  public abstract getMessage(): any;
  public abstract getId(): string;
  public abstract getUser(): string;
  public abstract getDescription(): string;
  protected abstract getAmount(): BigNumber;
  protected abstract getTokenForAllowance(): string;
  public getShortId = (): string => this.getId().substring(0, 7) + "..";

  protected constructor(protected readonly signature: string) {
    const split = ethers.utils.splitSignature(signature);
    [this.R, this.S, this.V] = [split.r, split.s, split.v];
    this.verification = new UnverifiedScript();
  }

  public getVerification = (): ScriptVerification => this.verification;

  public async verify(
    signerOrProvider: ethers.providers.Provider | ethers.Signer
  ): Promise<ScriptVerification> {
    const executor = await this.getExecutor(signerOrProvider);
    const message = this.getMessage();
    try {
      this.verification = new LoadingVerificationScript();
      await executor.verify(message, this.R, this.S, this.V);
      this.verification = new ValidScript();
    } catch (error: any) {
      // something strange happened, let's print it
      if (!error.data) console.error(error);

      // we can extract the verification failure reason
      const parsedErrorMessage = this.parseFailedVerifyError(error.data);
      this.verification = new VerificationFailedScript(parsedErrorMessage);
    }

    return this.verification;
  }

  public async execute(
    signer: ethers.Signer
  ): Promise<TransactionResponse | undefined> {
    const executor = await this.getExecutor(signer);
    const message = this.getMessage();
    try {
      this.verification = new ExecutingScript();
      return await executor
        .execute(message, this.R, this.S, this.V)
        .then(() => (this.verification = new UnverifiedScript()));
    } catch (error: any) {
      // something strange happened, let's print it
      if (!error.data) console.error(error);

      // we can extract the verification failure reason
      const parsedErrorMessage = this.parseFailedVerifyError(error.data);
      this.verification = new VerificationFailedScript(parsedErrorMessage);
    }
  }

  public async revoke(signer: ethers.Signer): Promise<TransactionResponse> {
    const executor = await this.getExecutor(signer);
    return await executor.revoke(this.getId());
  }

  public async hasAllowance(
    signerOrProvider: ethers.providers.Provider | ethers.Signer
  ): Promise<boolean> {
    return await AllowanceHelper.checkForERC20Allowance(
      this.getUser(),
      this.getTokenForAllowance(),
      this.getExecutorAddress(),
      this.getAmount(),
      signerOrProvider
    );
  }

  public async requestAllowance(
    signer: ethers.Signer
  ): Promise<TransactionResponse> {
    return await AllowanceHelper.requestERC20Allowance(
      this.getTokenForAllowance(),
      this.getExecutorAddress(),
      signer
    );
  }

  public toJson(): string {
    return {
      signature: this.signature,
      description: this.getDescription(),
      ...this.getMessage(),
    };
  }

  private async getExecutor(
    signerOrProvider: ethers.providers.Provider | ethers.Signer
  ): Promise<Contract> {
    const contractAddress = this.getExecutorAddress();
    const contractAbi = this.getExecutorAbi();
    return new ethers.Contract(contractAddress, contractAbi, signerOrProvider);
  }

  private parseFailedVerifyError(errorText: string): string {
    const hex = "0x" + errorText.substring(147);
    const withoutTrailing0s = hex.replace(/0*$/g, "");
    return ethers.utils.toUtf8String(withoutTrailing0s);
  }
}
