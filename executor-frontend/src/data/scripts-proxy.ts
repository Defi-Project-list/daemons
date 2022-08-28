import { BaseScript, parseScript } from "@daemons-fi/scripts-definitions";

const localStorageAddress = "http://localhost:5000/api";
const productionStorageAddress = "https://daemons-storage.onrender.com/api";

// define storage URL depending on frontend URL
const isTest = typeof window === "undefined";
const isDev = !isTest && window.location.href.includes("localhost");

export const storageAddress = isTest || isDev ? localStorageAddress : productionStorageAddress;

export class ScriptProxy {
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
