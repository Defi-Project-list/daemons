import { BaseScript, parseScript } from "@daemons-fi/scripts-definitions";
import { storageAddress } from ".";


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

        console.debug(`Fetching all scripts for chain ${chainId}`);
        const url = `${storageAddress}/scripts/${chainId}`;
        const requestOptions = { method: "GET", credentials: "include" };
        const response = await fetch(url, requestOptions as any);
        const json: any[] = await response.json();
        const scripts: BaseScript[] = [];
        for (const script of json) {
            scripts.push(await parseScript(script));
        }

        return scripts;
    }

    public static async fetchUserScripts(chainId?: string, user?: string): Promise<BaseScript[]> {
        if (!user || !chainId) {
            console.warn("Missing user or chain id. User scripts fetch aborted");
            return [];
        }

        console.debug(`Fetching user ${user} scripts for chain ${chainId}`);
        const url = `${storageAddress}/scripts/${chainId}/${user}`;

        const requestOptions = { method: "GET", credentials: "include" };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return [];

        const json: any[] = await response.json();
        const scripts: BaseScript[] = [];
        for (const script of json) {
            scripts.push(await parseScript(script));
        }

        return scripts;
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

    public static async markAsBroken(scriptId: string): Promise<void> {
        console.log(`Marking script ${scriptId} as broken`);
        const url = `${storageAddress}/scripts/mark-as-broken`;
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ scriptId })
        };

        await fetch(url, requestOptions as any);
    }
}
