import { BigNumber, utils } from "ethers";
import { ITransaction, TransactionOutcome } from "@daemons-fi/shared-definitions";
import { Transaction } from "../models/transaction";
import faker from "@faker-js/faker";

const randomOutcome = () => faker.random.arrayElement(Object.values(TransactionOutcome));
const randomScriptType = () =>
    faker.random.arrayElement(["Swap", "Transaction", "MmBase", "MmAdvanced", "Bridge"]);

/** Returns a randomized transaction */
export function transactionFactory(args: any): ITransaction {
    return {
        hash: args.hash ?? utils.hexlify(utils.randomBytes(32)),
        scriptId: args.scriptId ?? utils.hexlify(utils.randomBytes(32)),
        scriptType: args.scriptType ?? randomScriptType(),
        description: args.description ?? faker.random.words(4),
        chainId: args.chainId ?? BigNumber.from("42"),
        executingUser: args.executingUser ?? faker.finance.ethereumAddress(),
        beneficiaryUser: args.beneficiaryUser ?? faker.finance.ethereumAddress(),
        date: args.date ?? new Date(), // NOTE: date is always set by the endpoint. This line is just a filler.
        outcome: args.outcome ?? randomOutcome()
    };
}

/** Adds a Transaction to mongo and returns it */
export async function transactionDocumentFactory(args: any): Promise<ITransaction> {
    const transaction = transactionFactory(args);

    // this step simulates the transformation the object goes through when it is passed into
    // the body of a POST (i.e. BigNumber fields are serialized and not deserialized to the original object)
    const jsonTransformedTransaction = JSON.parse(JSON.stringify(transaction));

    return await Transaction.build(jsonTransformedTransaction).save();
}
