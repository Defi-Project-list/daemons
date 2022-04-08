import { GetCurrentChain } from '../chain-info';
import { Token } from '../chains-data/interfaces';


export class TokenProxy {

    public static async fetchTokens(chainId?: string): Promise<Token[]> {
        if (!chainId) {
            console.warn("Missing chain id. Tokens fetch aborted");
            return [];
        }

        return GetCurrentChain(chainId).tokens;
    }
}
