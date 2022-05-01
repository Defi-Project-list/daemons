import { BigNumber } from 'ethers';
import { IBalanceCondition, Balance } from "../conditions/balance";
import { IFollowCondition, Follow } from "../conditions/follow";
import { IFrequencyCondition, Frequency } from "../conditions/frequency";
import { IMaxRepetitionsCondition, Repetitions } from "../conditions/max-repetitions";
import { IPriceCondition, Price } from "../conditions/price";
import { AmountType } from "../conditions/shared";

export interface ISignedTransferAction extends ITransferAction {
    signature: string;
    description: string;
}

export interface ITransferAction {
    scriptId: string;
    token: string;
    destination: string;
    typeAmt: AmountType;
    amount: BigNumber;
    user: string;
    executor: string;
    chainId: BigNumber;
    balance: IBalanceCondition;
    frequency: IFrequencyCondition;
    price: IPriceCondition;
    repetitions: IMaxRepetitionsCondition;
    follow: IFollowCondition;
}

const Transfer = [
    { name: "scriptId", type: "bytes32" },                   // the token owned by the user
    { name: "token", type: "address" },                      // the token owned by the user
    { name: "destination", type: "address" },             // the token that should be swapped
    { name: "typeAmt", type: "bytes1" },                   // indicated the amount type [Absolute, Percentage]
    { name: "amount", type: "uint256" },                   // the amount to swap
    { name: "user", type: "address" },                        // the user that is signing the transaction
    { name: "executor", type: "address" },                 // the executor contract this message will be sent to
    { name: "chainId", type: "uint256" },                   // the chain in which the message was signed
    { name: "balance", type: "Balance" },                   // condition: balance
    { name: "frequency", type: "Frequency" },           // condition: frequency
    { name: "price", type: "Price" },                            // condition: balance
    { name: "repetitions", type: "Repetitions" },        // condition: max repetitions
    { name: "follow", type: "Follow" },                       // condition: after script
];

export const transferDomain = {
    name: "Daemons-Transfer-v01"
};

export const transferTypes = {
    Follow,
    Frequency,
    Balance,
    Transfer,
    Price,
    Repetitions,
};
