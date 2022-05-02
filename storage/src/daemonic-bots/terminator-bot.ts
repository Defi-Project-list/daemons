import {
    BaseScript,
    ScriptVerification,
    VerificationFailedScript,
    VerificationState
} from "@daemons-fi/scripts-definitions";
import { BrokenScript } from "../models/queues/broken-scripts";
import { Script } from "../models/scripts/script";
import { getProvider } from "./providers-builder";
import { parseScript } from "./script-builder";

export class TerminatorBot {
    public static execute = async (): Promise<number> => {
        console.log(`[🤖🪓 Terminator Bot] Starting`);
        const ids = await BrokenScript.distinct("scriptId");
        if (ids.length === 0) {
            console.log(`[Terminator Bot] No scripts to be processed. Terminating.`);
            return 0;
        }
        console.log(`[🤖🪓 Terminator Bot] ${ids.length} scripts to be processed`);

        const scripts: any[] = await Script.find({ scriptId: { $in: ids } });

        const falsePositive: string[] = [];
        const toBeRemoved: string[] = [];
        const processed: string[] = [];

        for (const script of scripts) {
            try {
                const parsedScript: BaseScript = await parseScript(script);
                const provider = getProvider(parsedScript.getMessage().chainId);
                const verification = await parsedScript.verify(provider);

                const queue = TerminatorBot.flagForRemoval(verification) ? toBeRemoved : falsePositive;
                queue.push(script.scriptId);
                processed.push(script.scriptId);
            } catch (error) {
                console.error(`An error occurred with the script ${script.scriptId}: ${error}`);
            }
        }

        console.log(`[🤖🪓 Terminator Bot] Checks completed`);
        console.log(`[🤖🪓 Terminator Bot] Processed: ${processed.length}/${ids.length}`);
        console.log(`[🤖🪓 Terminator Bot] True positive: ${toBeRemoved.length}`);
        console.log(`[🤖🪓 Terminator Bot] False positive: ${falsePositive.length}`);

        await BrokenScript.deleteMany({ scriptId: { $in: processed } });
        await Script.deleteMany({ scriptId: { $in: toBeRemoved } });
        console.log(`[🤖🪓 Terminator Bot] Deletion completed`);

        return toBeRemoved.length;
    };

    private static flagForRemoval = (verification: ScriptVerification) =>
        verification.state === VerificationState.errorCode &&
        (verification as VerificationFailedScript).code.includes("[FINAL]");
}
