import { AuthProxy } from './auth-proxy';
import { ScriptProxy } from './scripts-proxy';
import { StatsProxy } from "./stats-proxy";
import { TransactionProxy } from './transaction-proxy';

const localStorageAddress = 'http://localhost:5000/api';
const productionStorageAddress = 'https://daemons-storage.onrender.com/api';

// define storage URL depending on frontend URL
const isTest = typeof window === "undefined";
const isDev = !isTest && window.location.href.includes('localhost');

export const storageAddress = isTest || isDev
    ? localStorageAddress
    : productionStorageAddress;

/** Class used by the Frontend to communicate with the Storage */
export class StorageProxy {

    public static get auth() { return AuthProxy; }
    public static get script() { return ScriptProxy; }
    public static get txs() { return TransactionProxy; }
    public static get stats() { return StatsProxy; }
}
