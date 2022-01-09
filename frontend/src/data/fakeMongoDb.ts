import { BaseScript } from './script/base-script';
import { SwapScript } from './script/swap-script';


const preLoadedScript1 = '{"signature":"0x9c44f2ee6a12b59cd2d4edeedaf6390500e010547d0d6dcfb67c5b562b2cb8fd5a06efc224c91c8661c13c3c50f9f2c4fe6ffde8fb4a2f5c5c5d95bd00f88f8f1c","message":{"id":"0x107727d01b569b3fa8f9784b22d1fb22f2c70ce2022c5409232facba4559f831","amount":{"type":"BigNumber","hex":"0x093d1cc0"},"tokenFrom":"0x13512979ade267ab5100878e2e0f485b568328a4","tokenTo":"0x61e4cae3da7fd189e52a4879c7b8067d7c2cc0fa","user":"0xC35C79aE067576FcC474E51B18c4eE4Ab36C0274","frequency":{"enabled":false,"blocks":{"type":"BigNumber","hex":"0x00"},"startBlock":{"type":"BigNumber","hex":"0x00"}},"balance":{"enabled":false,"amount":{"type":"BigNumber","hex":"0x00"},"comparison":0,"token":"0x0000000000000000000000000000000000000000"},"executor":"0x0000000000000000000000000000000000000000"}}';
const preLoadedScript2 = '{"signature":"0xd92d8c36e0e77d2f85ed781a27a28a53f4cdefe4501238f3dd3b5589e4a823130474d9cd088cf7cc6813eaf47ed51ec83d1637178588db8eed53a038eb0653231c","message":{"id":"0x2d57d5ca6441ceae204cc69cf613df3a7703077b23005a3ecf8e29697933e488","amount":{"type":"BigNumber","hex":"0xa9df8c80"},"tokenFrom":"0x13512979ade267ab5100878e2e0f485b568328a4","tokenTo":"0x075a36ba8846c6b6f53644fdd3bf17e5151789dc","user":"0xC35C79aE067576FcC474E51B18c4eE4Ab36C0274","frequency":{"enabled":false,"blocks":{"type":"BigNumber","hex":"0x00"},"startBlock":{"type":"BigNumber","hex":"0x00"}},"balance":{"enabled":true,"amount":{"type":"BigNumber","hex":"0xb2d05e00"},"comparison":0,"token":"0x13512979ade267ab5100878e2e0f485b568328a4"},"executor":"0x0000000000000000000000000000000000000000"}}';

export const SCRIPTS: BaseScript[] = [
    SwapScript.fromJsonString(preLoadedScript1),
    SwapScript.fromJsonString(preLoadedScript2),
];

export function addScript(script: BaseScript) {
    SCRIPTS.push(script);
    console.log(script.toJsonString());
};

export function fetchAllScripts() {
    return SCRIPTS;
}

export function fetchScriptsForUser(user: string) {
    return SCRIPTS.filter(s => s.getUser().toLocaleLowerCase() === user.toLocaleLowerCase());
}
