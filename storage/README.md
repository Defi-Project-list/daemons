# Daemons - Storage

This folder contains the logic to store and retrieve scripts off-chain.


## Adding initial data

The `.initial-data` folder contains some data that can be used to manually seed the db.

To do so, open a console and type

- `mongosh` to open the mongo shell
- `use daemons` to select the daemons db
- `db.tokens.insertMany(<paste-here-tokens-list-collection>)` to add the tokens. Copy the data from `./.initial-data/tokens-list.ts`.
