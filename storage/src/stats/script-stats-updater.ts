import { SwapScript } from "../models/scripts/swap-script";
import { IScriptStats, ScriptStats } from "../models/stats/script-stats";
import { TransferScript } from "../models/scripts/transfer-script";
import { MmBaseScript } from "../models/scripts/mm-base-script";
import { ChainInfo } from ".";


export async function updateScriptStats(): Promise<void> {
    // delete all stats from today to prevent duplicates
    const today = new Date().toISOString().slice(0, 10);
    await ScriptStats.deleteMany({ date: today });

    // prepare and insert the stats for each chain
    const chains = Object.keys(ChainInfo());
    for (let chainId of chains) {
        await updateScriptStatsForChain(chainId);
    }
}

async function updateScriptStatsForChain(chainId: string): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const chainName = ChainInfo()[chainId];

    let todaysStatsForThisChain: IScriptStats[] = [
        {
            amount: await SwapScript.count({ chainId }),
            chain: chainName,
            date: today,
            kind: "Swap"
        },
        {
            amount: await TransferScript.count({ chainId }),
            chain: chainName,
            date: today,
            kind: "Transfer"
        },
        {
            amount: await MmBaseScript.count({ chainId }),
            chain: chainName,
            date: today,
            kind: "MmBase"
        }
    ];

    // remove 0-amount entries and insert
    todaysStatsForThisChain = todaysStatsForThisChain.filter(s => s.amount > 0);
    await ScriptStats.insertMany(todaysStatsForThisChain);
}
