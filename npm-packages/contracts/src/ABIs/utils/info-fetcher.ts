import { ContractInterface } from "ethers";

export const InfoFetcherABI: ContractInterface = [
  {
    inputs: [
      {
        internalType: "address",
        name: "mmPool",
        type: "address"
      },
      {
        internalType: "bool",
        name: "isV3",
        type: "bool"
      },
      {
        internalType: "address",
        name: "user",
        type: "address"
      },
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]"
      },
      {
        internalType: "address[]",
        name: "aTokens",
        type: "address[]"
      }
    ],
    name: "fetchMmInfo",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "totalCollateralETH",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "totalDebtETH",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "availableBorrowsETH",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "currentLiquidationThreshold",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "ltv",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "healthFactor",
                type: "uint256"
              }
            ],
            internalType: "struct AccountData",
            name: "accountData",
            type: "tuple"
          },
          {
            internalType: "uint128[]",
            name: "APYs",
            type: "uint128[]"
          },
          {
            internalType: "uint256[]",
            name: "balances",
            type: "uint256[]"
          }
        ],
        internalType: "struct MmInfo",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address"
      },
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]"
      }
    ],
    name: "fetchTokenBalances",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];
