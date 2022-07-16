import { gasTankABI } from "@daemons-fi/abis/build";
import { ITransaction } from "@daemons-fi/shared-definitions/build";
import { BigNumber, ethers, Event, utils } from "ethers";
import { Script } from "../models/scripts/script";
import { Transaction } from "../models/transaction";
import { bigNumberToFloat } from "../utils/big-number-to-float";
import { getProvider, IChainWithContracts, supportedChains } from "./utils/providers-builder";

/**
 * ## Tx-Adder Bot 🤖🔌
 *
 * The Tx-Adder bot (Luca) listens to the logs from the GasTank and is triggered anytime
 * a script is executed. With that info, it adds new transactions in the db.
 */
export class TxAdderBot {
    public static execute = (): void => {
        console.log(`[🤖🔌 Tx-Adder Bot] Starting`);

        for (const chain of Object.values(supportedChains)) {
            TxAdderBot.setupConnectionOnChain(chain);
        }
    };

    private static setupConnectionOnChain(chain: IChainWithContracts): void {
        const provider = getProvider(chain.id);

        const gasTank = new ethers.Contract(chain.contracts.GasTank, gasTankABI, provider);
        gasTank.on(
            "ScriptExecuted",
            async (scriptId: string, scriptOwner: string, executor: string, event: Event) => {
                // self-executing does not generate transactions
                if (scriptOwner === executor) return;

                // if tx already exists, abort
                const txHash = event.transactionHash;
                if ((await Transaction.countDocuments({ hash: txHash })) > 0) return;

                // otherwise create the transaction!
                const script = await Script.findOne({ scriptId: scriptId });
                if (!script) {
                    console.error({ message: `could not find script`, scriptId });
                    return;
                }

                const scriptType = (script as any).__type;
                const costDAEM = bigNumberToFloat(BigNumber.from((script as any).tip), 4);
                const costETH = 0;
                const profitDAEM = 0;

                const tx = {
                    hash: txHash,
                    scriptId: scriptId,
                    chainId: chain.id,
                    description: script.description,
                    beneficiaryUser: utils.getAddress(scriptOwner),
                    executingUser: utils.getAddress(executor),
                    date: new Date((await event.getBlock()).timestamp * 1000),
                    scriptType: scriptType,
                    costDAEM: costDAEM,
                    costEth: costETH,
                    profitDAEM: profitDAEM
                } as ITransaction;

                await Transaction.build(tx).save();
                console.log({
                    message: `[🤖🔌 Tx-Adder Bot] transaction detected`,
                    tx
                });
            }
        );

        console.log(`[🤖🔌 Tx-Adder Bot] setup complete for ${chain.name}`);
    }
}
