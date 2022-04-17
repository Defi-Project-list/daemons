import { IChainInfo, IContractsList } from '../interfaces';
import { AaveMMBaseAction, SwapAction, TransferAction } from './action-forms';
import { kovanAaveMM, kovanTokens } from './tokens';

const kovanContracts: IContractsList = {
    GasTank: '0x29A74Bab786C01E3181191a77Dfd5A590f2a47e1',
    DAEMToken: '0x19ff2C637621bEbe560f62b78cECc3C6970aC34b',
    Treasury: '0x63267ADD09A97f2ceC5669C85F020e48aA381002',
    GasPriceFeed: '0x69c05f9E5f370546c41CDa2bA2C7f439f2460a32',
    PriceRetriever: '0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136',

    SwapExecutor: '0x645e479C9F41Bb7Ac4Ee49852c8dDbc46fE3Ab20',
    TransferExecutor: '0x210d841EB9606B1fb27Bf676F0B6Ec4C5C7176E2',
    MmBaseExecutor: '0x1da737403e1e81BAf21dCC913B34250508Dc45e5',
    MmAdvancedExecutor: '0x074cC149D5fdF427c65a1f3E83dde9815DCa3376',
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
    actions: [TransferAction, SwapAction, AaveMMBaseAction]
};
