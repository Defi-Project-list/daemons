import { storageAddress } from '.';
import { Token } from '../tokens';

export class TokenProxy {

    private static cachedTokens: { [chainId: string]: Token[]; } = {};

    public static async fetchTokens(chainId?: string): Promise<Token[]> {
        if (!chainId) {
            console.warn("Missing chain id. Tokens fetch aborted");
            return [];
        }

        if (!this.cachedTokens[chainId]) {
            console.log(`Fetching tokens list for chain ${chainId}`);
            const url = `${storageAddress}/tokens/${chainId}`;
            const requestOptions = { method: 'GET', credentials: 'include' };
            const response = await fetch(url, requestOptions as any);
            const tokens: Token[] = await response.json();
            this.cachedTokens[chainId] = tokens;
        }

        return this.cachedTokens[chainId];
    }
}
