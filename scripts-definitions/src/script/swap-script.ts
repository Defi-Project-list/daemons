import { BigNumber, ContractInterface } from "ethers";
import { BalanceFactory } from "../condition-base-factories/balance-factory";
import { FrequencyFactory } from "../condition-base-factories/frequency-factory";
import { PriceFactory } from "../condition-base-factories/price-factory";
import { RepetitionsFactory } from "../condition-base-factories/repetitions-factory";
import { FollowFactory } from "../condition-base-factories/follow-factory";
import { BaseScript } from "./base-script";
import { ISwapAction } from "@daemons-fi/shared-definitions/build";

export class SwapScript extends BaseScript {
  public constructor(
    private readonly message: ISwapAction,
    signature: string,
    private readonly description: string
  ) {
    super(signature);
  }

  public readonly ScriptType = "SwapScript";
  public getExecutorAddress = () => this.message.executor;
  public getExecutorAbi = () => swapScriptAbi;
  public getMessage = () => this.message;
  public getId = () => this.message.scriptId;
  public getUser = () => this.message.user;
  public getDescription = () => this.description;

  public static async fromStorageJson(object: any) {
    const message: ISwapAction = object;

    // complex objects are broken down and need to be recreated. Sigh.
    message.chainId = BigNumber.from(object.chainId);
    message.amount = BigNumber.from(object.amount);

    message.balance = BalanceFactory.fromJson(message.balance);
    message.frequency = FrequencyFactory.fromJson(message.frequency);
    message.price = PriceFactory.fromJson(message.price);
    message.repetitions = RepetitionsFactory.fromJson(message.repetitions);
    message.follow = FollowFactory.fromJson(object.follow);

    return new SwapScript(message, object.signature, object.description);
  }
}

const swapScriptAbi: ContractInterface = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "cost",
        type: "uint256",
      },
    ],
    name: "Executed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "GAS_COST",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINIMUM_GAS_FOR_SCRIPT_EXECUTION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "scriptId",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "tokenFrom",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenTo",
            type: "address",
          },
          {
            internalType: "bytes1",
            name: "typeAmt",
            type: "bytes1",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "address",
            name: "kontract",
            type: "address",
          },
          {
            internalType: "address",
            name: "executor",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "chainId",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "enabled",
                type: "bool",
              },
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "bytes1",
                name: "comparison",
                type: "bytes1",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            internalType: "struct Balance",
            name: "balance",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "enabled",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "delay",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "start",
                type: "uint256",
              },
            ],
            internalType: "struct Frequency",
            name: "frequency",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "enabled",
                type: "bool",
              },
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "bytes1",
                name: "comparison",
                type: "bytes1",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct Price",
            name: "price",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "enabled",
                type: "bool",
              },
              {
                internalType: "uint32",
                name: "amount",
                type: "uint32",
              },
            ],
            internalType: "struct Repetitions",
            name: "repetitions",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "enabled",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "shift",
                type: "uint256",
              },
              {
                internalType: "bytes32",
                name: "scriptId",
                type: "bytes32",
              },
              {
                internalType: "address",
                name: "executor",
                type: "address",
              },
            ],
            internalType: "struct Follow",
            name: "follow",
            type: "tuple",
          },
        ],
        internalType: "struct Swap",
        name: "message",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_id",
        type: "bytes32",
      },
    ],
    name: "getRepetitions",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "preliminaryCheck",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_id",
        type: "bytes32",
      },
    ],
    name: "revoke",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_gasPriceFeed",
        type: "address",
      },
    ],
    name: "setGasFeed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_gasTank",
        type: "address",
      },
    ],
    name: "setGasTank",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "setMinimumGas",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_priceRetriever",
        type: "address",
      },
    ],
    name: "setPriceRetriever",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "scriptId",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "tokenFrom",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenTo",
            type: "address",
          },
          {
            internalType: "bytes1",
            name: "typeAmt",
            type: "bytes1",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "address",
            name: "kontract",
            type: "address",
          },
          {
            internalType: "address",
            name: "executor",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "chainId",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "enabled",
                type: "bool",
              },
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "bytes1",
                name: "comparison",
                type: "bytes1",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            internalType: "struct Balance",
            name: "balance",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "enabled",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "delay",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "start",
                type: "uint256",
              },
            ],
            internalType: "struct Frequency",
            name: "frequency",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "enabled",
                type: "bool",
              },
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "bytes1",
                name: "comparison",
                type: "bytes1",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
            ],
            internalType: "struct Price",
            name: "price",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "enabled",
                type: "bool",
              },
              {
                internalType: "uint32",
                name: "amount",
                type: "uint32",
              },
            ],
            internalType: "struct Repetitions",
            name: "repetitions",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "enabled",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "shift",
                type: "uint256",
              },
              {
                internalType: "bytes32",
                name: "scriptId",
                type: "bytes32",
              },
              {
                internalType: "address",
                name: "executor",
                type: "address",
              },
            ],
            internalType: "struct Follow",
            name: "follow",
            type: "tuple",
          },
        ],
        internalType: "struct Swap",
        name: "message",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
    ],
    name: "verify",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "verifyGasTank",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "verifyRevocation",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
];
