import { storageAddress } from '.';
import fetch from 'cross-fetch';


export class AuthProxy {

    public static async checkAuthentication(userAddress: string): Promise<boolean> {
        const url = `${storageAddress}/auth/is-authenticated/${userAddress}`;
        const requestOptions = { method: 'GET', credentials: 'include' };
        const response = await fetch(url, requestOptions as any);
        return response.status === 200;
    }

    public static async getLoginMessage(userAddress: string): Promise<string> {
        const url = `${storageAddress}/auth/message-to-sign/${userAddress}`;
        const requestOptions = { method: 'GET', credentials: 'include' };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) throw new Error(`Something has gone wrong: ${response.status}`);

        const jsn = await response.json();
        return jsn.message;
    }

    public static async login(userAddress: string, signedMessage: string): Promise<void> {
        const url = `${storageAddress}/auth/login`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                userAddress,
                signedMessage,
            }),
        };

        await fetch(url, requestOptions as any);
    }
}