import { BaseScript } from './script/base-script';
import { SwapScript } from './script/swap-script';
import { TransferScript } from './script/transfer-script';
import { Token } from './tokens';

const storageAddress = 'http://localhost:5000/api';

/** Class used by the Frontend to communicate with the Storage */
export class StorageProxy {

    // Authentication

    public static async checkAuthentication(userAddress: string): Promise<boolean> {
        const url = `${storageAddress}/auth/is-authenticated/${userAddress}`;
        const requestOptions = { method: 'GET', credentials: 'include' };
        const response = await fetch(url, requestOptions as any);
        return response.status === 200;
    }

    public static async getLoginMessage(userAddress: string): Promise<string> {
        const url = `${storageAddress}/auth/message-to-sign/${userAddress}`;
        const requestOptions = { method: 'GET', credentials: 'include' };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) throw new Error(`Something has gone wrong: ${response.status}`);

        const jsn = await response.json();
        return jsn.message;
    }

    public static async login(userAddress: string, signedMessage: string): Promise<void> {
        const url = `${storageAddress}/auth/login`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                userAddress,
                signedMessage,
            }),
        };

        await fetch(url, requestOptions as any);
    }

    // Scripts

    public static async saveScript(script: BaseScript): Promise<void> {
        const url = `${storageAddress}/scripts/${StorageProxy.getSaveEndpoint(script)}`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: script.toJsonString(),
        };

        await fetch(url, requestOptions as any);
    }

    private static getSaveEndpoint(script: BaseScript): string {
        switch (script.ScriptType) {
            case 'SwapScript':
                return 'swap';
            case 'TransferScript':
                return 'transfer';
            default:
                throw new Error("Unsupported script type: " + script.ScriptType);
        }
    }

    public static async fetchScripts(chainId?: string): Promise<BaseScript[]> {
        if (!chainId) {
            console.warn("Missing chain id. Scripts fetch aborted");
            return [];
        }

        console.log(`Fetching all scripts for chain ${chainId}`);
        const url = `${storageAddress}/scripts/${chainId}`;
        const requestOptions = { method: 'GET', credentials: 'include' };
        const response = await fetch(url, requestOptions as any);
        const json: any[] = await response.json();
        const scripts: BaseScript[] = [];
        for (const script of json) {
            scripts.push(await StorageProxy.parseScript(script));
        }

        return scripts;
    }

    public static async fetchUserScripts(chainId?: string, user?: string): Promise<BaseScript[]> {
        if (!user || !chainId) {
            console.warn("Missing user or chain id. User scripts fetch aborted");
            return [];
        }

        console.log(`Fetching user ${user} scripts for chain ${chainId}`);
        const url = `${storageAddress}/scripts/${chainId}/${user}`;

        const requestOptions = { method: 'GET', credentials: 'include' };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return [];

        const json: any[] = await response.json();
        const scripts: BaseScript[] = [];
        for (const script of json) {
            scripts.push(await StorageProxy.parseScript(script));
        }

        return scripts;
    }

    private static async parseScript(script: any): Promise<BaseScript> {
        switch (script.type) {
            case 'SwapScript':
                return await SwapScript.fromStorageJson(script);
            case 'TransferScript':
                return await TransferScript.fromStorageJson(script);
            default:
                throw new Error("Unsupported script type: " + script.ScriptType);
        }
    }

    public static async updateScriptDescription(scriptId: string, scriptType: string, description: string): Promise<void> {
        console.log(`Updating description for script ${scriptId}`);
        const url = `${storageAddress}/scripts/update-description`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ scriptId, scriptType, description }),
        };

        await fetch(url, requestOptions as any);
    }

    public static async revokeScript(scriptId: string, scriptType: string): Promise<void> {
        console.log(`Revoking script ${scriptId}`);
        const url = `${storageAddress}/scripts/revoke`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ scriptId, scriptType }),
        };

        await fetch(url, requestOptions as any);
    }

    // Tokens
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
