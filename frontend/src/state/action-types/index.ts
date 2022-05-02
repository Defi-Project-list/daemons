export enum ActionType {
    // user scripts
    FETCH_USER_SCRIPTS = "FETCH_USER_SCRIPTS",
    NEW_USER_SCRIPT = "NEW_USER_SCRIPT",
    REMOVE_USER_SCRIPT = "REMOVE_USER_SCRIPT",
    FETCH_EXECUTABLE_SCRIPTS = "FETCH_EXECUTABLE_SCRIPTS",
    REMOVE_EXECUTABLE_SCRIPT = "REMOVE_EXECUTABLE_SCRIPT",
    SET_SCRIPTS_LOADING = "SET_SCRIPTS_LOADING",

    // scripts creation queue
    CLEAN_WORKBENCH = "CLEAN_WORKBENCH",
    ADD_TO_WORKBENCH = "ADD_TO_WORKBENCH",

    // wallet
    WALLET_UPDATE = "WALLET_UPDATE",
    AUTH_CHECK = "AUTH_CHECK",
    FETCH_DAEM_BALANCE = "FETCH_DAEM_BALANCE",

    // gas tank
    GAS_TANK_BALANCE = "GAS_TANK_BALANCE",
    GAS_TANK_CLAIMABLE = "GAS_TANK_CLAIMABLE",

    // staking
    STAKING_BALANCE = "STAKING_BALANCE",
    STAKING_CLAIMABLE = "STAKING_CLAIMABLE",

    // history
    FETCH_TRANSACTIONS = "FETCH_TRANSACTIONS",
    UPDATE_TRANSACTION = "UPDATE_TRANSACTION",
    SET_TRANSACTIONS_LOADING = "SET_TRANSACTIONS_LOADING"
}
