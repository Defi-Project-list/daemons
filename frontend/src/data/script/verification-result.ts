interface IVerificationResultDetails {
    name: string;
    description: string;
}

export enum VerificationState {
    unverified,
    valid,
    loading,
    errorCode,
    executing,
}

export abstract class ScriptVerification {
    abstract readonly state: VerificationState;
    abstract toString(): string;
}

export class UnverifiedScript extends ScriptVerification {
    public readonly state = VerificationState.unverified;
    public toString = (): string => "Unverified";
}

export class ValidScript extends ScriptVerification {
    public readonly state = VerificationState.valid;
    public toString = (): string => "Valid";
}

export class LoadingVerificationScript extends ScriptVerification {
    public readonly state = VerificationState.loading;
    public toString = (): string => "Loading";
}

export class ExecutingScript extends ScriptVerification {
    public readonly state = VerificationState.executing;
    public toString = (): string => "Executing";
}

export class VerificationFailedScript extends ScriptVerification {
    public readonly state = VerificationState.errorCode;
    public toString = (): string => this.getUserFriendlyName();

    /** List containing all possible results. For reference, check the backend's README. */
    private readonly possibleResults: { [code: string]: IVerificationResultDetails } = {
        "[SIGNATURE][FINAL]": {
            name: "Signature does not match",
            description: "The signature does not match with the script content."
        },
        "[REVOKED][FINAL]": {
            name: "Script has been revoked",
            description: "The script owner revoked the script and cannot be executed anymore."
        },
        "[REPETITIONS_CONDITION][FINAL]": {
            name: "Max repetitions reached",
            description:
                "The script has reached the max number of repetitions and cannot be executed anymore."
        },
        "[FOLLOW_CONDITION][TMP]": {
            name: "Waiting for other script",
            description: "This script is bound to another script that hasn't been executed yet."
        },
        "[FREQUENCY_CONDITION][TMP]": {
            name: "Cool-down in place",
            description: "Not enough time has passed for this script to be executed."
        },
        "[BALANCE_CONDITION_LOW][TMP]": {
            name: "Balance too low",
            description:
                "The user has not enough tokens in the wallet and the balance condition cannot be triggered."
        },
        "[BALANCE_CONDITION_HIGH][TMP]": {
            name: "Balance too high",
            description:
                "The user has too many tokens in the wallet and the balance condition cannot be triggered."
        },
        "[PRICE_CONDITION_LOW][TMP]": {
            name: "Price too low",
            description: "The token price is below the one set in the price condition."
        },
        "[PRICE_CONDITION_HIGH][TMP]": {
            name: "Price too high",
            description: "The token price is above the one set in the price condition."
        },
        "[SCRIPT_BALANCE][TMP]": {
            name: "Script balance low",
            description: "The minimum balance needed for the script to run is not reached."
        },
        "[GAS][TMP]": {
            name: "Gas tank too empty",
            description: "The user doesn't have enough gas in the gas tank to execute the scripts."
        },
        "[HEALTH_FACTOR_LOW][TMP]": {
            name: "Health factor low",
            description: "Health Factor lower than threshold"
        },
        "[HEALTH_FACTOR_HIGH][TMP]": {
            name: "Health factor high",
            description: "Health Factor higher than threshold"
        },
        "[ALLOWANCE][ACTION]": {
            name: "Missing allowance",
            description:
                "The user needs to give allowance to the executor contract to move some tokens"
        },
        "[CHAIN][ERROR]": {
            name: "Wrong chain",
            description: "The script is trying to be executed in the wrong chain."
        },
        "[BORROW_TOO_HIGH][FINAL]": {
            name: "Trying to borrow a dangerous amount",
            description:
                "The script is set to borrowing a percentage that is too high and would put the user at risk."
        },
        "[BORROW_TOO_HIGH][TMP]": {
            name: "Not enough borrowing power",
            description:
                "The script is trying to borrow an amount that would put the user at risk now, but would be alright in another moment."
        },
        "[NO_DEBT][TMP]": {
            name: "No debt to repay",
            description: "The script is to repay a debt that does not exist (yet/anymore)"
        }
    };

    constructor(public readonly code: string) {
        super();
    }

    /** Gets the verification result name to be shown to the user */
    public getUserFriendlyName = () => this.possibleResults[this.code.toUpperCase()]?.name ?? "Other Reason";

    /** Gets the description to be shown to the user */
    public getDescription = () =>
        this.possibleResults[this.code.toUpperCase()]?.description ??
        "The script cannot be executed. Check the console for more details";
}