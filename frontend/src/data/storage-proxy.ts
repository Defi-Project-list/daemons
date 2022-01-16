import { BaseScript } from './script/base-script';
import { SwapScript } from './script/swap-script';
import { TransferScript } from './script/transfer-script';

const storageAddress = 'http://localhost:5000/api';

/** Class used by the Frontend to communicate with the Storage */
export class StorageProxy {

    public static async saveScript(script: BaseScript): Promise<void> {
        const url = `${storageAddress}/scripts/${StorageProxy.getSaveEndpoint(script)}`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: script.toJsonString(),
        };

        await fetch(url, requestOptions);
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

    public static async fetchScripts(): Promise<BaseScript[]> {
        const url = `${storageAddress}/scripts`;
        const response = await fetch(url);
        const json: any[] = await response.json();
        return json.map(StorageProxy.parseScript);
    }

    public static async fetchUserScripts(user: string | null): Promise<BaseScript[]> {
        if (!user) return [];

        const url = `${storageAddress}/scripts/${user}`;
        const response = await fetch(url);
        const json: any[] = await response.json();
        return json.map(StorageProxy.parseScript);
    }

    private static parseScript(script: any): BaseScript {
        switch (script.type) {
            case 'SwapScript':
                return SwapScript.fromStorageJson(script);
            case 'TransferScript':
                return TransferScript.fromStorageJson(script);
            default:
                throw new Error("Unsupported script type: " + script.ScriptType);
        }
    }
}
