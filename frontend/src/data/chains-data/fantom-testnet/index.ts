import { IChainInfo, IContractsList } from '../interfaces';
import { TransferAction } from './action-forms';
import { fantomTestnetTokens } from './tokens';

const contracts: IContractsList = {
    GasTank: '0x7aa32870031c7F908618C31844220e28437398A0',
    DAEMToken: '0xbe6216682D743e414b119Af0AFBA91687685F099',
    Treasury: '0x6A60c533AF6A8250E59745dc416f794c9a28cE29',
    GasPriceFeed: '0x7C5559A8e28dea123795e61FCc3cFbE0B1E9AfaF',
    PriceRetriever: '0x46F388505b6ba78C5732346653F96a206A738d2B',

    SwapExecutor: '0xC37d6d4eB5dD159298bfD4aAb417D720B515b81e',
    TransferExecutor: '0x6380Df9147BF0183d62D220A86f82803F96153EB',
    MmBaseExecutor: '0x3Fb4D8e31696761df3a5a8454F6990E4461109F2',
    MmAdvancedExecutor: '0x419CF7c2a9B0F60C5C84aBD6F2FBDCF177dEdcCC',
};

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
    contracts: contracts,
    actions: [TransferAction],
};
