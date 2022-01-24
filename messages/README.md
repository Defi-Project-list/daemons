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

### Repetitions

Sets a maximum amount of numbers a script can be run.


## Script Actions

### Swap

Swaps a token for another one.
Currently all swaps go through the same AMM, but in the future the user will have the possibility of specifying their favorite exchange.

### Transfer

Sends a certain amount of tokens to the specified address.


## NOTE:

If you change something here, remember to update:

 - **Backend** at `backend/contracts/messages`, containing the definitions used by the solidity contracts to interpret messages.
 - **Frontend** at `frontend/src/data/script`, containing the scripts representation for the frontend.
 - **Frontend** at `frontend/src/components/create-script-page/script-factory.ts`, containing the code that creates scripts.
 - **Storage** at `storage/src/models`, containing the db schemas.

Also remember: **every change to the messages is a breaking change (no backward compatibility)** and will require to **redeploy contracts** and **update the references to point to the new ones**.

Think about them properly before implementing them or doing any change!
