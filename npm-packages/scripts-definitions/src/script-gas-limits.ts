import { BigNumber } from "ethers";

const gasLimits: { [scriptType: string]: number } = {
    SwapScript: 350000,
    TransferScript: 200000,
    MmBaseScript: 350000,
    MmAdvancedScript: 350000,
    ZapInScript: 500000,
    ZapOutScript: 500000,
    BeefyScript: 400000,
    PassScript: 150000,
};

export const getGasLimitForScript = (scriptType: string): BigNumber => {
    const gasLimit = gasLimits[scriptType];
    if (!gasLimit) throw new Error(`Unrecognized script type: ${scriptType}`);
    return BigNumber.from(gasLimit);
};
