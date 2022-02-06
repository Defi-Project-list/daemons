import { combineReducers } from "redux";
import { gasTankReducer } from './gas-tank-reducer';
import { scriptReducer } from './script-reducer';
import { tokensReducer } from './tokens-reducer';
import { walletReducer } from './wallet-reducer';


const reducers = combineReducers({
    script: scriptReducer,
    wallet: walletReducer,
    gasTank: gasTankReducer,
    tokens: tokensReducer,
});

export default reducers;
