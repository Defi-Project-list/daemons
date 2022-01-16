import { BaseScript } from './script/base-script';
import { SwapScript } from './script/swap-script';
import { TransferScript } from './script/transfer-script';


const preLoadedScript1 = '{"signature":"0x766b66e288356b7c9396edac09259226309f412275d82ccc9494f038142155a325f9fd1583d1095dc319335705788cebffc7d926d439612d850b13a8e19a12c01b","message":{"scriptId":"0xbe94b27ce8b61a62fd669b302a139e96af3422d42ce50b698eb975d4d23bc583","amount":{"type":"BigNumber","hex":"0x0821ab0d4414980000"},"token":"0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa","destination":"0x2d407fBCA4984621099664789EadCE26524B6335","user":"0xC35C79aE067576FcC474E51B18c4eE4Ab36C0274","frequency":{"enabled":false,"blocks":{"type":"BigNumber","hex":"0x00"},"startBlock":{"type":"BigNumber","hex":"0x00"}},"balance":{"enabled":false,"amount":{"type":"BigNumber","hex":"0x00"},"comparison":0,"token":"0x0000000000000000000000000000000000000000"},"price":{"enabled":false,"value":{"type":"BigNumber","hex":"0x00"},"comparison":0,"token":"0x0000000000000000000000000000000000000000"},"executor":"0xCEd7Db876508fBCd96F28D5f94ee2Ef6d73b8EeD","chainId":{"type":"BigNumber","hex":"0x2a"}}}';

export const SCRIPTS: BaseScript[] = [
    TransferScript.fromJsonString(preLoadedScript1),
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
