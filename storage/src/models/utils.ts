import { BigNumber } from 'ethers';

/**
 * Stringifies the BigNumber values for the models
 * @param bigNumber bigNumber that can be in 2 forms: string (will be left untouched), serialized BigNumber (will be stringified)
 */
export function stringifyBigNumber(bigNumber: any): string {
    // string, leave untouched
    if (typeof bigNumber === 'string') return bigNumber;

    // BigNumber, stringify
    if (bigNumber._hex) return bigNumber.toString();

    // Serialized BigNumber, rebuild and stringify
    if (bigNumber.hex) return BigNumber.from(bigNumber.hex).toString();

    // No idea, throw
    throw new Error(`Argument '${bigNumber}' does not seem a bigNumber`);
}
