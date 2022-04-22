import { storageAddress } from ".";
import { BaseScript } from "../script/base-script";
import { MmBaseScript } from "../script/mm-base-script";
import { SwapScript } from "../script/swap-script";
import { TransferScript } from "../script/transfer-script";

export class ScriptProxy {
    public static async saveScript(script: BaseScript): Promise<void> {
        const url = `${storageAddress}/scripts/`;
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ script: script.toJson(), type: script.ScriptType })
        };

        await fetch(url, requestOptions as any);
    }

    public static async fetchScripts(chainId?: string): Promise<BaseScript[]> {
        if (!chainId) {
            console.warn("Missing chain id. Scripts fetch aborted");
            return [];
        }

        console.log(`Fetching all scripts for chain ${chainId}`);
        const url = `${storageAddress}/scripts/${chainId}`;
        const requestOptions = { method: "GET", credentials: "include" };
        const response = await fetch(url, requestOptions as any);
        const json: any[] = await response.json();
        const scripts: BaseScript[] = [];
        for (const script of json) {
            scripts.push(await this.parseScript(script));
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

        const requestOptions = { method: "GET", credentials: "include" };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return [];

        const json: any[] = await response.json();
        const scripts: BaseScript[] = [];
        for (const script of json) {
            scripts.push(await this.parseScript(script));
        }

        return scripts;
    }

    private static async parseScript(script: any): Promise<BaseScript> {
        switch (script.__type) {
            case "SwapScript":
                return await SwapScript.fromStorageJson(script);
            case "TransferScript":
                return await TransferScript.fromStorageJson(script);
            case "MmBaseScript":
                return await MmBaseScript.fromStorageJson(script);
            default:
                throw new Error("Unsupported script type: " + script.ScriptType);
        }
    }

    public static async updateScriptDescription(
        scriptId: string,
        description: string
    ): Promise<void> {
        console.log(`Updating description for script ${scriptId}`);
        const url = `${storageAddress}/scripts/update-description`;
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ scriptId, description })
        };

        await fetch(url, requestOptions as any);
    }

    public static async revokeScript(scriptId: string): Promise<void> {
        console.log(`Revoking script ${scriptId}`);
        const url = `${storageAddress}/scripts/revoke`;
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ scriptId })
        };

        await fetch(url, requestOptions as any);
    }
}
