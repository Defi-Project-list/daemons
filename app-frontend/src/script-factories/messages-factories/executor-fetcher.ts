import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { ScriptAction } from "../../data/chains-data/action-form-interfaces";


export function getExecutorFromScriptAction(action: ScriptAction, chainId: string) {
    if (!IsChainSupported(chainId))
        throw new Error("Trying to fetch executor for unsupported chain");

    const contracts = GetCurrentChain(chainId).contracts;
    switch (action) {
        case ScriptAction.SWAP: return contracts.SwapperScriptExecutor;
        case ScriptAction.TRANSFER: return contracts.TransferScriptExecutor;
        case ScriptAction.MM_BASE: return contracts.MmBaseScriptExecutor;
        case ScriptAction.MM_ADV: return contracts.MmAdvancedScriptExecutor;
        case ScriptAction.ZAP_IN: return contracts.ZapInScriptExecutor;
        case ScriptAction.ZAP_OUT: return contracts.ZapOutScriptExecutor;
        case ScriptAction.BEEFY: return contracts.BeefyScriptExecutor;
        default: throw new Error(`Cannot find executor address for action ${action}`);
    }
}
