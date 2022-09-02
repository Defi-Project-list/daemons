import { ContractInterface } from "ethers";

export const InfoFetcherABI: ContractInterface = [
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
    name: "fetchBalances",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "coin",
            type: "uint256"
          },
          {
            internalType: "uint256[]",
            name: "tokens",
            type: "uint256[]"
          }
        ],
        internalType: "struct Balances",
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
        name: "tokenA",
        type: "address"
      },
      {
        internalType: "address",
        name: "tokenB",
        type: "address"
      },
      {
        internalType: "address",
        name: "router",
        type: "address"
      },
      {
        internalType: "address",
        name: "user",
        type: "address"
      }
    ],
    name: "fetchLpInfo",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "pairAddress",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "balance",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "token0",
            type: "address"
          },
          {
            internalType: "address",
            name: "token1",
            type: "address"
          },
          {
            internalType: "uint112",
            name: "reserve0",
            type: "uint112"
          },
          {
            internalType: "uint112",
            name: "reserve1",
            type: "uint112"
          }
        ],
        internalType: "struct LPInfo",
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
            components: [
              {
                internalType: "uint256",
                name: "coin",
                type: "uint256"
              },
              {
                internalType: "uint256[]",
                name: "tokens",
                type: "uint256[]"
              }
            ],
            internalType: "struct Balances",
            name: "balances",
            type: "tuple"
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
        internalType: "address",
        name: "_treasury",
        type: "address"
      },
      {
        internalType: "address",
        name: "_gasTank",
        type: "address"
      }
    ],
    name: "fetchUserStateOnDaemons",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "claimableDAEM",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "claimableETH",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "ethInGasTank",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "daemInGasTank",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "daemInTreasury",
            type: "uint256"
          }
        ],
        internalType: "struct DaemonsInfo",
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
        internalType: "address",
        name: "_treasury",
        type: "address"
      },
      {
        internalType: "address",
        name: "_gasTank",
        type: "address"
      },
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]"
      }
    ],
    name: "fetchUserStateOnDaemonsAndBalances",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "claimableDAEM",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "claimableETH",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "ethInGasTank",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "daemInGasTank",
                type: "uint256"
              },
              {
                internalType: "uint256",
                name: "daemInTreasury",
                type: "uint256"
              }
            ],
            internalType: "struct DaemonsInfo",
            name: "daemonsInfo",
            type: "tuple"
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "coin",
                type: "uint256"
              },
              {
                internalType: "uint256[]",
                name: "tokens",
                type: "uint256[]"
              }
            ],
            internalType: "struct Balances",
            name: "balances",
            type: "tuple"
          }
        ],
        internalType: "struct DaemonsInfoWithBalances",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];
