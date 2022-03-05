import { AuthenticationProxy } from './authentication-proxy';
import { ScriptProxy } from './scripts-proxy';
import { TokenProxy } from './tokens-proxy';
import { TransactionProxy } from './transaction-proxy';

export const storageAddress = 'http://localhost:5000/api';

/** Class used by the Frontend to communicate with the Storage */
export class StorageProxy {

    public static get authentication() { return AuthenticationProxy; }
    public static get tokens() { return TokenProxy; }
    public static get script() { return ScriptProxy; }
    public static get transaction() { return TransactionProxy; }
}
