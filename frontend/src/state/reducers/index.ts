import { combineReducers } from "redux";
import { scriptReducer } from './scriptReducer';


const reducers = combineReducers({
    script: scriptReducer
});

export default reducers;
