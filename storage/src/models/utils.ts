import { BigNumber } from 'ethers';

/**
 * Stringifies the BigNumber values for the models
 * @param bigNumber bigNumber that can be in 2 forms: string (will be left untouched), serialized BigNumber (will be stringified)
 */
export function stringifyBigNumber(bigNumber: any): string {
    if (typeof bigNumber === 'string') return bigNumber;

    return BigNumber.from(bigNumber.hex).toString();
}
