import { storageAddress } from ".";
import fetch from "cross-fetch";

export class ProfileProxy {
    public static async updateUsername(username: string): Promise<string> {
        const url = `${storageAddress}/profile/username`;
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username })
        };
        const response = await fetch(url, requestOptions as any);
        if (response.status !== 200) return response.text();
        return "";
    }
}
