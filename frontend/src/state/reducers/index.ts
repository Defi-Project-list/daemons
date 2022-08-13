import { combineReducers } from "redux";
import { gasPriceFeedReducer } from "./gas-price-feed-reducer";
import { gasTankReducer } from "./gas-tank-reducer";
import { pricesReducer } from "./prices-reducer";
import { scriptReducer } from "./script-reducer";
import { stakingReducer } from "./staking-reducer";
import { tipJarReducer } from "./tip-jar-reducer";
import { treasuryReducer } from "./treasury-reducer";
import { userReducer } from "./user-reducer";
import { walletReducer } from "./wallet-reducer";
import { workbenchReducer } from "./workbench-reducer";

const reducers = combineReducers({
    script: scriptReducer,
    wallet: walletReducer,
    user: userReducer,
    gasTank: gasTankReducer,
    tipJar: tipJarReducer,
    staking: stakingReducer,
    workbench: workbenchReducer,
    gasPriceFeed: gasPriceFeedReducer,
    prices: pricesReducer,
    treasury: treasuryReducer
});

export default reducers;
