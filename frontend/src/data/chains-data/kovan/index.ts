import { IChainInfo, IContractsList } from '../interfaces';
import { AaveMMAdvancedAction, AaveMMBaseAction, SwapAction, TransferAction } from './action-forms';
import { kovanTokens } from './tokens';

const kovanContracts: IContractsList = {
    GasTank: '0x29A74Bab786C01E3181191a77Dfd5A590f2a47e1',
    DAEMToken: '0x19ff2C637621bEbe560f62b78cECc3C6970aC34b',
    Treasury: '0x63267ADD09A97f2ceC5669C85F020e48aA381002',
    GasPriceFeed: '0x69c05f9E5f370546c41CDa2bA2C7f439f2460a32',
    PriceRetriever: '0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136',

    SwapExecutor: '0xC162e8Be1C34EE034080FA51cD6cDc257b9C1b98',
    TransferExecutor: '0xF1E06B9754668799F0393785F74D5876a394b169',
    MmBaseExecutor: '0x4E89786ac785CA2D25C9178e2699E3CE56343d63',
    MmAdvancedExecutor: '0xB3193b440931393062F385a9D88C9034B689199B',
};

export const kovanInfo: IChainInfo = {
    name: "Kovan",
    id: "42",
    hex: "0x2a",
    defaultRPC: "https://kovan.infura.io/v3/",
    iconPath: "/icons/kovan.jpg",
    coinName: 'Ether',
    coinSymbol: 'ETH',
    coinDecimals: 18,
    explorerUrl: 'https://kovan.etherscan.io/',
    explorerTxUrl: 'https://kovan.etherscan.io/tx/',
    tokens: kovanTokens,
    contracts: kovanContracts,
    actions: [TransferAction, SwapAction, AaveMMBaseAction, AaveMMAdvancedAction],
};
