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
    GasTank: "0x6f105c09115673B3225A6928d461Cf9F15950b29",
    DAEMToken: "0xfE74d8de9Bb3d36EEeBe31b9FC0ca5a97aB97803",
    Treasury: "0x06539bB59e1AF1923dB53d37e3ffA99133e0253c",
    GasPriceFeed: "0x3EF5244088D933F8a1975881A48E2777A9dB1e98",
    PriceRetriever: "0x86Cac325445891f1D37EE5000eaA2d11eb04EA1D",

    SwapExecutor: "0xAA7A64FF3038E109b00D4978986EA206A3f28454",
    TransferExecutor: "0x3EB16b38DfE7725e699e0A76Cf668a690ca0C34C",
    MmBaseExecutor: "0xaAFEc93916351D3Bf840FB6E8a9cdc7CE475aC07",
    MmAdvancedExecutor: "0x942BB6D5e2fe14C89bCCce898fC42a59bc882E04"
};

export const rinkebyContracts: IContractsList = {
    PriceRetriever: "0x8B9e2137382191ad1C680B7cb7c87b8eEB7A8cae",
    DAEMToken: "0x9dc85a8b22bCF95A669485830C8EFaF109AAB30c",
    GasTank: "0xa52CE7d38E7508aE0a3141e131865586373D7Afd",
    Treasury: "0xBbE0c880e267ccAAaCA194c04263D2b571AB19f0",
    GasPriceFeed: "0x1f8b080138f9234c922f333F21Eb52130E15e7A1",

    SwapExecutor: "0x841e9c57FfC6A0246D12C4754Ce121DB9AdF3801",
    TransferExecutor: "0x657b49614B56A026C0a5E436341cDDC98771480C",
    MmBaseExecutor: "0xD1C6f87402fB8a494162263D42389db8E89a2876",
    MmAdvancedExecutor: "0x74A2a783E0F4fE0B57144A053ecDd02cF5ba9929"
};

export const fantomTestnetContracts: IContractsList = {
    PriceRetriever: "0x8F934b2c8c2f6b496B54B3c7EF13D044f3543061",
    DAEMToken: "0x4F234c9Ef3498633b140B6c6380F24d6Cc61218a",
    GasTank: "0xCEd7Db876508fBCd96F28D5f94ee2Ef6d73b8EeD",
    Treasury: "0xA4B7f58aB1B7f1E663a335f5ca76f24198a037E2",
    GasPriceFeed: "0x44345BCd8FF2f858134e84b25D5ee18f6d28358B",

    SwapExecutor: "0x510Ec3cD4841D45C75a5b057e6A21e8436ded1B5",
    TransferExecutor: "0x71cF2EE9EE783DF86351Db881a5e2Da0bC3BE6Cd",
    MmBaseExecutor: "0x2F53c5273Df8736086c2F2a86e2A6a0fB9468ab3",
    MmAdvancedExecutor: "0x1bCb155E9A09a3F5b14548661D1fb33bdf276A30"
};
