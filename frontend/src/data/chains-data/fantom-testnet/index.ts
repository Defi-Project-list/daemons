import { fantomTestnetContracts } from "@daemons-fi/addresses/build";
import { IChainInfo } from '../interfaces';
import { AaveMMAdvancedAction, AaveMMBaseAction, SwapAction, TransferAction, ZapInAction, ZapOutAction } from './action-forms';
import { fantomTestnetDexes, fantomTestnetTokens } from './tokens';

export const fantomTestnetInfo: IChainInfo = {
    name: "FantomTestnet",
    id: "4002",
    hex: "0xfa2",
    defaultRPC: "https://rpc.testnet.fantom.network/",
    iconPath: "/icons/fantom.jpg",
    coinName: 'Fantom',
    coinSymbol: 'FTM',
    coinDecimals: 18,
    explorerUrl: 'https://testnet.ftmscan.com/',
    explorerTxUrl: 'https://testnet.ftmscan.com/tx/',
    tokens: fantomTestnetTokens,
    dexes: fantomTestnetDexes,
    contracts: fantomTestnetContracts,
    actions: [TransferAction, SwapAction, AaveMMBaseAction, AaveMMAdvancedAction, ZapInAction, ZapOutAction],
};
