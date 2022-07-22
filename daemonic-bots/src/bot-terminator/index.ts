import {
    BaseScript,
    ScriptVerification,
    VerificationFailedScript,
    VerificationState
} from "@daemons-fi/scripts-definitions";
import { INotification, Notification } from "@daemons-fi/db-schema";
import { BrokenScript } from "@daemons-fi/db-schema";
import { Script } from "@daemons-fi/db-schema";
import { getProvider } from "../utils/providers-builder";
import { parseScript } from "./utils/script-builder";

/**
 * ## Terminator Bot 🤖🪓
 *
 * The Terminator bot (Arny) takes care of scripts that have been signaled as broken.
 * It verifies them and if they really are unusable, it will remove them from the DB.
 */
export class TerminatorBot {
    public static execute = async (): Promise<number> => {
        console.log(`[🤖🪓 Terminator Bot] Starting`);
        const ids = await BrokenScript.distinct("scriptId");
        if (ids.length === 0) {
            console.log(`[Terminator Bot] No scripts to be processed. Terminating.`);
            return 0;
        }
        console.log(`[🤖🪓 Terminator Bot] ${ids.length} scripts to be processed`);

        const scripts: any[] = await Script.find({ scriptId: { $in: ids } }).lean();
        const scriptIds = new Set(scripts.map((s) => s.scriptId));

        const falsePositive: string[] = [];
        const toBeRemoved: string[] = [];
        const processed: string[] = [];
        const notFound: string[] = ids.filter((id) => !scriptIds.has(id));
        const notifications: INotification[] = [];

        for (const script of scripts) {
            try {
                const parsedScript: BaseScript = await parseScript(script);
                const provider = getProvider(parsedScript.getMessage().chainId);
                const verification = await parsedScript.verify(provider);

                const isToBeRemoved = TerminatorBot.flagForRemoval(verification);

                const queue = isToBeRemoved ? toBeRemoved : falsePositive;
                queue.push(script.scriptId);
                processed.push(script.scriptId);

                if (isToBeRemoved) {
                    notifications.push({
                        title: "Removed inexecutable script",
                        description: `The following script has been automatically removed as it was no longer executable: '${script.description}'`,
                        chainId: script.chainId,
                        user: script.user
                    });
                }
            } catch (error) {
                console.error(`An error occurred with the script ${script.scriptId}: ${error}`);
            }
        }

        console.log(`[🤖🪓 Terminator Bot] Checks completed`);
        console.log(`[🤖🪓 Terminator Bot] Processed: ${processed.length}/${ids.length}`);
        console.log(`[🤖🪓 Terminator Bot] True positive: ${toBeRemoved.length}`);
        console.log(`[🤖🪓 Terminator Bot] False positive: ${falsePositive.length}`);
        console.log(`[🤖🪓 Terminator Bot] Not found: ${notFound.length}`);

        await BrokenScript.deleteMany({ scriptId: { $in: processed } });
        await BrokenScript.deleteMany({ scriptId: { $in: notFound } });
        await Script.deleteMany({ scriptId: { $in: toBeRemoved } });
        await Notification.insertMany(notifications);
        console.log(`[🤖🪓 Terminator Bot] Deletion completed`);

        return toBeRemoved.length;
    };

    private static flagForRemoval = (verification: ScriptVerification) =>
        verification.state === VerificationState.errorCode &&
        (verification as VerificationFailedScript).code.includes("[FINAL]");
}
