import { BigNumber, utils } from 'ethers';
import { IBalanceCondition, IFrequencyCondition, IPriceCondition } from '../../../messages/definitions/condition-messages';
import { ISignedSwapAction } from '../../../messages/definitions/swap-action-messages';
import { ISignedTransferAction } from '../../../messages/definitions/transfer-action-messages';
import { SwapScript } from '../models/swap-script';
import { TransferScript } from '../models/transfer-script';



/** Returns a randomized balance condition */
function balanceConditionFactory(args: any): IBalanceCondition {
    return {
        enabled: args.enabled ?? false,
        comparison: args.comparison ?? 0x01,
        amount: args.amount ?? utils.parseEther("1"),
        token: args.token ?? '0x596e8221a30bfe6e7eff67fee664a01c73ba3c56',
    };
}

/** Returns a randomized price condition */
function priceConditionFactory(args: any): IPriceCondition {
    return {
        enabled: args.enabled ?? false,
        comparison: args.comparison ?? 0x01,
        value: args.value ?? utils.parseEther("1"),
        token: args.token ?? '0x596e8221a30bfe6e7eff67fee664a01c73ba3c56',
    };
}

/** Returns a randomized frequency condition */
function frequencyConditionFactory(args: any): IFrequencyCondition {
    return {
        enabled: args.enabled ?? false,
        blocks: args.blocks ?? BigNumber.from("1"),
        startBlock: args.startBlock ?? BigNumber.from("0"),
    };
}

/** Returns a randomized signed swap action */
export function signedSwapActionFactory(args: any): ISignedSwapAction {
    return {
        signature: args.signature ?? 'IAmASignature',
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        tokenFrom: args.tokenFrom ?? '0x000002',
        tokenTo: args.tokenTo ?? '0x000003',
        amount: args.amount ?? utils.parseEther("1"),
        user: args.user ?? '0x9a2f243c605e6908d96b18e21fb82bf288b19ef3',
        executor: args.executor ?? '0xd7754711773489f31a0602635f3f167826ce53c5',
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
    };
}

/** Returns a randomized signed transfer action */
export function signedTransferActionFactory(args: any): ISignedTransferAction {
    return {
        signature: args.signature ?? 'IAmASignature',
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        token: args.tokenFrom ?? '0x000002',
        destination: args.tokenTo ?? '0x000003',
        amount: args.amount ?? utils.parseEther("1"),
        user: args.user ?? '0x9a2f243c605e6908d96b18e21fb82bf288b19ef3',
        executor: args.executor ?? '0xd7754711773489f31a0602635f3f167826ce53c5',
        chainId: args.chainId ?? BigNumber.from("42"),
        balance: balanceConditionFactory(args.balance ?? {}),
        frequency: frequencyConditionFactory(args.frequency ?? {}),
        price: priceConditionFactory(args.price ?? {}),
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
