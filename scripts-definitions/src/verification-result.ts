import { possibleVerificationErrors } from "./script-error-messages";

export enum VerificationState {
  unverified,
  valid,
  loading,
  errorCode,
  executing,
}

export abstract class ScriptVerification {
  abstract readonly state: VerificationState;
  abstract name: string;
  abstract description: string;
  public toString = (): string => this.name;
}

export class UnverifiedScript extends ScriptVerification {
  public readonly state = VerificationState.unverified;
  public readonly name = "Unverified";
  public readonly description = "The script has not been verified yet";
}

export class ValidScript extends ScriptVerification {
  public readonly state = VerificationState.valid;
  public readonly name = "Valid";
  public readonly description =
    "This seems to be a valid script and can be executed";
}

export class LoadingVerificationScript extends ScriptVerification {
  public readonly state = VerificationState.loading;
  public readonly name = "Loading";
  public readonly description = "The script is being verified right now";
}

export class ExecutingScript extends ScriptVerification {
  public readonly state = VerificationState.executing;
  public readonly name = "Executing";
  public readonly description = "The script is being executed in this moment";
}

export class VerificationFailedScript extends ScriptVerification {
  public readonly state = VerificationState.errorCode;
  public readonly name;
  public readonly description;

  constructor(public readonly code: string) {
    super();
    const verificationErrorDetails =
      possibleVerificationErrors[this.code.toUpperCase()];

    this.name = verificationErrorDetails?.name ?? "Other Reason";
    this.description =
      verificationErrorDetails.description ??
      "The script cannot be executed. Check the console for more details";
  }
}
