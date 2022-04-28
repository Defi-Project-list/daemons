import { IChainInfo, IContractsList } from '../interfaces';
import { AaveMMAdvancedAction, AaveMMBaseAction, SwapAction, TransferAction } from './action-forms';
import { kovanTokens } from './tokens';

const kovanContracts: IContractsList = {
    GasTank: '0x29A74Bab786C01E3181191a77Dfd5A590f2a47e1',
    DAEMToken: '0x19ff2C637621bEbe560f62b78cECc3C6970aC34b',
    Treasury: '0x63267ADD09A97f2ceC5669C85F020e48aA381002',
    GasPriceFeed: '0x69c05f9E5f370546c41CDa2bA2C7f439f2460a32',
    PriceRetriever: '0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136',

    SwapExecutor: '0x91Fe0e7547F7F02Ad119fea513064aE72c057d56',
    TransferExecutor: '0xBD704A09D56D1cC078dfDa9994b34879eFFAD5Fd',
    MmBaseExecutor: '0xDA0CBAbd4bAC7EF38492092dB31f6c89A7f8E88a',
    MmAdvancedExecutor: '0x60465465F19053f94410c231E395149b08D3d363',
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
