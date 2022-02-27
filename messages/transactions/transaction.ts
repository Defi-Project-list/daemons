import { BigNumber } from 'ethers';

export enum TransactionOutcome {
    Waiting = 'W',
    Confirmed = 'C',
    Failed = 'F',
    NotFound = 'NF',
}

export interface ITransaction {
    hash: string,
    chainId: BigNumber,
    executingUser: string,
    beneficiaryUser: string,
    date: Date,
    outcome: TransactionOutcome,
}
