import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { ScriptAction } from "../../data/chains-data/action-form-interfaces";


export function getExecutorFromScriptAction(action: ScriptAction, chainId: string) {
    if (!IsChainSupported(chainId))
        throw new Error("Trying to fetch executor for unsupported chain");

    const contracts = GetCurrentChain(chainId).contracts;
    switch (action) {
        case ScriptAction.SWAP: return contracts.SwapExecutor;
        case ScriptAction.TRANSFER: return contracts.TransferExecutor;
        case ScriptAction.MMBASE: return contracts.MmBaseExecutor;
        default: throw new Error(`Cannot find executor address for action ${action}`);
    }
}
