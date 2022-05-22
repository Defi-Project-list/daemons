
export interface IContractsList {
    GasTank: string;
    DAEMToken: string;
    Treasury: string;
    GasPriceFeed: string;
    PriceRetriever: string;

    // executors
    SwapExecutor: string;
    TransferExecutor: string;
    MmBaseExecutor: string;
    MmAdvancedExecutor: string;
}

export const kovanContracts: IContractsList = {
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

export const rinkebyContracts: IContractsList = {
    PriceRetriever: "0xf679088D6f27A7F8F28e1A4642461FB65337704D",
    DAEMToken: "0x7bF06253416bE429414d62C60cc413d2bFfdE8FC",
    GasTank: "0x51d04DbB19C4133D1c573992296D71Dc01e35aD7",
    Treasury: "0xCfa3852Dad56211B3Cbf6270b720AD8367F87bD5",
    GasPriceFeed: "0x419CF7c2a9B0F60C5C84aBD6F2FBDCF177dEdcCC",

    SwapExecutor: "0x570c1a344BBEEB685b8C14D3B0a59Da3D967931E",
    TransferExecutor: "0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136",
    MmBaseExecutor: "0x09c89F158A3fF7A2A3c3DcCdF77E8D8761946684",
    MmAdvancedExecutor: "0xAB3B0A5631E10786a19F950FD73af7b6724111AA"
};

export const fantomTestnetContracts: IContractsList = {
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
