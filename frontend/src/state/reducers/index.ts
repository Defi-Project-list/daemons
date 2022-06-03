import { combineReducers } from "redux";
import { gasPriceFeedReducer } from "./gas-price-feed-reducer";
import { gasTankReducer } from './gas-tank-reducer';
import { historyReducer } from './history-reducer';
import { scriptReducer } from './script-reducer';
import { stakingReducer } from './staking-reducer';
import { tipJarReducer } from "./tip-jar-reducer";
import { walletReducer } from './wallet-reducer';
import { workbenchReducer } from "./workbench-reducer";


const reducers = combineReducers({
    script: scriptReducer,
    wallet: walletReducer,
    gasTank: gasTankReducer,
    gasPriceFeed: gasPriceFeedReducer,
    tipJar: tipJarReducer,
    staking: stakingReducer,
    history: historyReducer,
    workbench: workbenchReducer,
});

export default reducers;
