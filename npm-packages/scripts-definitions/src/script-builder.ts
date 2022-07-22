import { BaseScript } from "./script/base-script";
import { PassScript } from "./script/pass-script";
import { SwapScript } from "./script/swap-script";
import { TransferScript } from "./script/transfer-script";
import { MmBaseScript } from "./script/mm-base-script";
import { MmAdvancedScript } from "./script/mm-adv-script";
import { ZapInScript } from "./script/zap-in-script";
import { ZapOutScript } from "./script/zap-out-script";
import { BeefyScript } from "./script/beefy-script";

/**
 * Builds a script object from a db record
 * @param script the database record representing the script
 */
export async function parseScript(script: any): Promise<BaseScript> {
    switch (script.__type) {
        case "SwapScript":
            return await SwapScript.fromStorageJson(script);
        case "TransferScript":
            return await TransferScript.fromStorageJson(script);
        case "MmBaseScript":
            return await MmBaseScript.fromStorageJson(script);
        case "MmAdvancedScript":
            return await MmAdvancedScript.fromStorageJson(script);
        case "ZapInScript":
            return await ZapInScript.fromStorageJson(script);
        case "ZapOutScript":
            return await ZapOutScript.fromStorageJson(script);
        case "BeefyScript":
            return await BeefyScript.fromStorageJson(script);
        case "PassScript":
            return await PassScript.fromStorageJson(script);
        default:
            throw new Error("Unsupported script type: " + script.__type);
    }
}
