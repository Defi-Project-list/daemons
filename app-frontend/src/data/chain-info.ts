import { IChainInfo, IToken } from "./chains-data/interfaces";
import { mumbaiInfo } from "./chains-data/mumbai";
import { unsupportedChain } from "./chains-data/unsupported";

export const ChainInfo: { [chainId: string]: IChainInfo } = {
    "80001": mumbaiInfo
};

export const GetCurrentChain = (chainId: string): IChainInfo =>
    IsChainSupported(chainId) ? ChainInfo[chainId] : unsupportedChain;

export const IsChainSupported = (chainId: string): boolean => !!ChainInfo[chainId];

export const GetAvailableChains = (): IChainInfo[] => Object.values(ChainInfo);

export const ZeroAddress = "0x0000000000000000000000000000000000000000";
export const ZeroId = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const CoinAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export const GetCurrentChainTokensDictionary = (chainId: string): { [address: string]: IToken } => {
    const result: { [address: string]: IToken } = {};
    GetCurrentChain(chainId).tokens.forEach((t) => (result[t.address] = t));
    return result;
};
