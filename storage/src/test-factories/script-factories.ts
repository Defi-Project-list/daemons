import { BigNumber, utils } from 'ethers';
import { ComparisonType, IBalanceCondition, IFollowCondition, IFrequencyCondition, IMaxRepetitionsCondition, IPriceCondition } from '../../../shared-definitions/scripts/condition-messages';
import { ISignedSwapAction } from '../../../shared-definitions/scripts/swap-action-messages';
import { ISignedTransferAction } from '../../../shared-definitions/scripts/transfer-action-messages';
import { SwapScript } from '../models/swap-script';
import { TransferScript } from '../models/transfer-script';
import faker from '@faker-js/faker';

const randomEthAmount = () => utils.parseEther(faker.datatype.number({ min: 0.01, max: 10, precision: 0.01 }).toString());
const randomBigNumber = () => BigNumber.from(faker.datatype.number({ min: 0, max: 10000 }).toString());

/** Returns a randomized balance condition */
function balanceConditionFactory(args: any): IBalanceCondition {
    return {
        enabled: args.enabled ?? false,
        comparison: args.comparison ?? ComparisonType.GreaterThan,
        amount: args.amount ?? randomEthAmount(),
        token: args.token ?? '0x596e8221a30bfe6e7eff67fee664a01c73ba3c56',
    };
}

/** Returns a randomized price condition */
function priceConditionFactory(args: any): IPriceCondition {
    return {
        enabled: args.enabled ?? false,
        comparison: args.comparison ?? ComparisonType.GreaterThan,
        value: args.value ?? randomEthAmount(),
        token: args.token ?? faker.finance.ethereumAddress(),
    };
}

/** Returns a randomized frequency condition */
function frequencyConditionFactory(args: any): IFrequencyCondition {
    return {
        enabled: args.enabled ?? false,
        delay: args.blocks ?? randomBigNumber(),
        start: args.startBlock ?? randomBigNumber(),
    };
}

/** Returns a randomized frequency condition */
function repetitionsConditionFactory(args: any): IMaxRepetitionsCondition {
    return {
        enabled: args.enabled ?? false,
        amount: args.amount ?? randomBigNumber(),
    };
}

/** Returns a randomized frequency condition */
function followConditionFactory(args: any): IFollowCondition {
    return {
        enabled: args.enabled ?? false,
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        shift: args.amount ?? randomBigNumber(),
    };
}

/** Returns a randomized signed swap action */
export function signedSwapActionFactory(args: any): ISignedSwapAction {
    return {
        signature: args.signature ?? utils.hexlify(utils.randomBytes(40)),
        description: args.description ?? faker.random.words(4),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        tokenFrom: args.tokenFrom ?? faker.finance.ethereumAddress(),
        tokenTo: args.tokenTo ?? faker.finance.ethereumAddress(),
        amount: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {}),
    };
}

/** Returns a randomized signed transfer action */
export function signedTransferActionFactory(args: any): ISignedTransferAction {
    return {
        signature: args.signature ?? utils.hexlify(utils.randomBytes(40)),
        description: args.description ?? faker.random.words(4),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        token: args.tokenFrom ?? faker.finance.ethereumAddress(),
        destination: args.tokenTo ?? faker.finance.ethereumAddress(),
        amount: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {}),
    };
}

/** Adds a SwapScript to mongo and returns it */
export async function swapScriptDocumentFactory(args: any): Promise<ISignedSwapAction> {
    const signedScript = signedSwapActionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedScript = JSON.parse(JSON.stringify(signedScript));

    return await SwapScript.build(jsonTransformedScript).save();
}

/** Adds a TransferScript to mongo and returns it */
export async function transferScriptDocumentFactory(args: any): Promise<ISignedTransferAction> {
    const signedScript = signedTransferActionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedScript = JSON.parse(JSON.stringify(signedScript));

    return await TransferScript.build(jsonTransformedScript).save();
}
