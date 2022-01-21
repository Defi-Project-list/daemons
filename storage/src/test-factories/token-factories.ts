import { IToken, ITokenDocument, Token } from '../models/token';
import faker from '@faker-js/faker';

/** Returns a randomized token */
export function tokenFactory(args: any): IToken {
    return {
        name: args.name ?? faker.hacker.noun(),
        symbol: args.scriptId ?? faker.hacker.abbreviation(),
        address: args.address ?? faker.finance.ethereumAddress(),
        decimals: args.decimals ?? 18,
        hasPriceFeed: args.hasPriceFeed ?? false,
        logoURL: args.logoURL ?? faker.internet.avatar(),
        chainId: args.chainId ?? '42',
    };
}

/** Adds a randomized Token to mongo and returns it */
export async function tokenDocumentFactory(args: any): Promise<ITokenDocument> {
    const token = tokenFactory(args);
    return await Token.build(token).save();
}
