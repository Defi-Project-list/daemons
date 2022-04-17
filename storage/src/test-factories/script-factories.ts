import { BigNumber, utils } from "ethers";
import {
    AmountType,
    ComparisonType,
    IBalanceCondition,
    IFollowCondition,
    IFrequencyCondition,
    IHealthFactorCondition,
    IMaxRepetitionsCondition,
    IPriceCondition
} from "@daemons-fi/shared-definitions";
import { ISignedSwapAction } from "@daemons-fi/shared-definitions";
import { ISignedTransferAction } from "@daemons-fi/shared-definitions";
import { SwapScript } from "../models/scripts/swap-script";
import { TransferScript } from "../models/scripts/transfer-script";
import faker from "@faker-js/faker";
import { BaseMoneyMarketActionType, ISignedMMBaseAction } from "@daemons-fi/shared-definitions";
import { MmBaseScript } from "../models/scripts/mm-base-script";

const randomEthAmount = () =>
    utils.parseEther(faker.datatype.number({ min: 0.01, max: 10, precision: 0.01 }).toString());
const randomBigNumber = () =>
    BigNumber.from(faker.datatype.number({ min: 0, max: 10000 }).toString());

/** Returns a randomized balance condition */
function balanceConditionFactory(args: any): IBalanceCondition {
    return {
        enabled: args.enabled ?? false,
        comparison: args.comparison ?? ComparisonType.GreaterThan,
        amount: args.amount ?? randomEthAmount(),
        token: args.token ?? "0x596e8221a30bfe6e7eff67fee664a01c73ba3c56"
    };
}

/** Returns a randomized price condition */
function priceConditionFactory(args: any): IPriceCondition {
    return {
        enabled: args.enabled ?? false,
        comparison: args.comparison ?? ComparisonType.GreaterThan,
        value: args.value ?? randomEthAmount(),
        token: args.token ?? faker.finance.ethereumAddress()
    };
}

/** Returns a randomized frequency condition */
function frequencyConditionFactory(args: any): IFrequencyCondition {
    return {
        enabled: args.enabled ?? false,
        delay: args.blocks ?? randomBigNumber(),
        start: args.startBlock ?? randomBigNumber()
    };
}

/** Returns a randomized frequency condition */
function repetitionsConditionFactory(args: any): IMaxRepetitionsCondition {
    return {
        enabled: args.enabled ?? false,
        amount: args.amount ?? randomBigNumber()
    };
}

/** Returns a randomized frequency condition */
function followConditionFactory(args: any): IFollowCondition {
    return {
        enabled: args.enabled ?? false,
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        shift: args.amount ?? randomBigNumber()
    };
}

/** Returns a randomized HealthFactor condition */
function healthFactorConditionFactory(args: any): IHealthFactorCondition {
    return {
        enabled: args.enabled ?? false,
        comparison: args.comparison ?? ComparisonType.GreaterThan,
        amount: args.amount ?? randomEthAmount(),
        kontract: args.kontract ?? "0x596e8221a30bfe6e7eff67fee664a01c73ba3c56"
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
        typeAmt: args.typeAmt ?? AmountType.Absolute,
        amount: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {})
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

/** Returns a randomized signed transfer action */
export function signedTransferActionFactory(args: any): ISignedTransferAction {
    return {
        signature: args.signature ?? utils.hexlify(utils.randomBytes(40)),
        description: args.description ?? faker.random.words(4),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        token: args.token ?? faker.finance.ethereumAddress(),
        destination: args.destination ?? faker.finance.ethereumAddress(),
        typeAmt: args.typeAmt ?? AmountType.Absolute,
        amount: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {})
    };
}

/** Adds a TransferScript to mongo and returns it */
export async function transferScriptDocumentFactory(args: any): Promise<ISignedTransferAction> {
    const signedScript = signedTransferActionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedScript = JSON.parse(JSON.stringify(signedScript));

    return await TransferScript.build(jsonTransformedScript).save();
}

/** Returns a randomized signed mmBase action */
export function signedMmBaseActionFactory(args: any): ISignedMMBaseAction {
    return {
        signature: args.signature ?? utils.hexlify(utils.randomBytes(40)),
        description: args.description ?? faker.random.words(4),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        token: args.token ?? faker.finance.ethereumAddress(),
        aToken: args.aToken ?? faker.finance.ethereumAddress(),
        action: args.typeAmt ?? BaseMoneyMarketActionType.Deposit,
        typeAmt: args.typeAmt ?? AmountType.Absolute,
        amount: args.amount ?? randomEthAmount(),
        user: args.user ?? faker.finance.ethereumAddress(),
        kontract: args.kontract ?? faker.finance.ethereumAddress(),
        executor: args.executor ?? faker.finance.ethereumAddress(),
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
        repetitions: repetitionsConditionFactory(args.repetitions ?? {}),
        follow: followConditionFactory(args.follow ?? {}),
        healthFactor: healthFactorConditionFactory(args.healthFactor ?? {})
    };
}

/** Adds a MmBaseScript to mongo and returns it */
export async function mmBaseScriptDocumentFactory(args: any): Promise<ISignedMMBaseAction> {
    const signedScript = signedMmBaseActionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedScript = JSON.parse(JSON.stringify(signedScript));

    return await MmBaseScript.build(jsonTransformedScript).save();
}
