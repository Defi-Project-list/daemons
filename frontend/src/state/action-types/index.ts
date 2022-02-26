export enum ActionType {
    // user scripts
    FETCH_USER_SCRIPTS = "FETCH_USER_SCRIPTS",
    FETCH_ALL_SCRIPTS = "FETCH_ALL_SCRIPTS",
    NEW_SCRIPT = "NEW_SCRIPT",
    REMOVE_SCRIPT = "REMOVE_SCRIPT",
    SET_LOADING = "SET_LOADING",

    // wallet
    WALLET_UPDATE = "WALLET_UPDATE",
    AUTH_CHECK = "AUTH_CHECK",

    // gas tank
    GAS_TANK_BALANCE = "GAS_TANK_BALANCE",
    GAS_TANK_CLAIMABLE = "GAS_TANK_CLAIMABLE",

    // tokens
    FETCH_TOKENS = "FETCH_TOKENS",
};
