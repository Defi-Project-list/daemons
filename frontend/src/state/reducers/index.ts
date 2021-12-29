import { combineReducers } from "redux";
import { scriptReducer } from './script-reducer';
import { walletReducer } from './wallet-reducer';


const reducers = combineReducers({
    script: scriptReducer,
    wallet: walletReducer,
});

export default reducers;
