# Messages

This folder contains the messages signed by the users.

Each message follows the EIP712 specifications.


## Current Conditions

### Balance

Triggers the action whenever the user owns a certain amount of a token.

### Price

Triggers the action whenever the price of a certain token passes a threshold defined by the user.

### Frequency

Triggers the action every fixed amount of blocks.


## Current Actions

### Swap

Swaps a token for another one.
Currently all swaps go through the same AMM, but in the future the user will have the possibility of specifying their favorite exchange.

### Transfer

Sends a certain amount of tokens to the specified address.

## Note:

⚠️⚠️ This folder should always be in sync between frontend and backend! ⚠️⚠️
