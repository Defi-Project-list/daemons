import { BaseScript } from './script/base-script';
import { SwapScript } from './script/swap-script';
import { TransferScript } from './script/transfer-script';


const preLoadedScript1 = '{"signature":"0x59813f1289af8820adc23fd4cc4de281d10790f62c886e9625d1cb18b0ca8b05626514ea3a1a8caacd44998d65e34b4c759d2edbd23057812ad18571198b99ff1c","message":{"id":"0xdd7cf4bad179d0c8ff79f67cc9b18a475f9f064a8e3a5e9e407a0dfd5b763b6f","amount":{"type":"BigNumber","hex":"0x0821ab0d4414980000"},"token":"0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa","destination":"0x2d407fBCA4984621099664789EadCE26524B6335","user":"0xC35C79aE067576FcC474E51B18c4eE4Ab36C0274","frequency":{"enabled":false,"blocks":{"type":"BigNumber","hex":"0x00"},"startBlock":{"type":"BigNumber","hex":"0x00"}},"balance":{"enabled":false,"amount":{"type":"BigNumber","hex":"0x00"},"comparison":0,"token":"0x0000000000000000000000000000000000000000"},"price":{"enabled":false,"value":{"type":"BigNumber","hex":"0x00"},"comparison":0,"token":"0x0000000000000000000000000000000000000000"},"executor":"0x2d407fBCA4984621099664789EadCE26524B6335"}}';
const preLoadedScript2 = '{"signature":"0xd92d8c36e0e77d2f85ed781a27a28a53f4cdefe4501238f3dd3b5589e4a823130474d9cd088cf7cc6813eaf47ed51ec83d1637178588db8eed53a038eb0653231c","message":{"id":"0x2d57d5ca6441ceae204cc69cf613df3a7703077b23005a3ecf8e29697933e488","amount":{"type":"BigNumber","hex":"0xa9df8c80"},"tokenFrom":"0x13512979ade267ab5100878e2e0f485b568328a4","tokenTo":"0x075a36ba8846c6b6f53644fdd3bf17e5151789dc","user":"0xC35C79aE067576FcC474E51B18c4eE4Ab36C0274","frequency":{"enabled":false,"blocks":{"type":"BigNumber","hex":"0x00"},"startBlock":{"type":"BigNumber","hex":"0x00"}},"balance":{"enabled":true,"amount":{"type":"BigNumber","hex":"0xb2d05e00"},"comparison":0,"token":"0x13512979ade267ab5100878e2e0f485b568328a4"},"executor":"0x0000000000000000000000000000000000000000"}}';

export const SCRIPTS: BaseScript[] = [
    TransferScript.fromJsonString(preLoadedScript1),
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
