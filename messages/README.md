# Messages

This folder contains the messages signed by the users and **is shared across all projects**.

The folder has multiple goals:
- Describe the types of the messages exchanged between projects, to enforce type checking and prevent errors
- Describe the EIP712 specifications for signing messages on the blockchain. These are grouped with the rest to minimize errors.

Messages describe how scripts look like. They have **conditions** and **actions**.

NOTE: conditions are atomic, while each action **contains all conditions** (that can be enabled or disabled).


## Script Conditions

### Balance

Triggers the action whenever the user owns a certain amount of a token.

### Price

Triggers the action whenever the price of a certain token passes a threshold defined by the user.

### Frequency

Triggers the action every fixed amount of blocks.


## Script Actions

### Swap

Swaps a token for another one.
Currently all swaps go through the same AMM, but in the future the user will have the possibility of specifying their favorite exchange.

### Transfer

Sends a certain amount of tokens to the specified address.
