import { assert } from 'chai';
import { storageAddress, StorageProxy } from '..';
import nock from 'nock';
import { Token } from '../../tokens';


describe('Tokens Proxy', () => {

    const tokens: Token[] = [
        {
            name: 'FooToken',
            symbol: 'FOO',
            address: '0x123',
            logoURI: '',
            decimals: 18,
        }
    ];

    afterEach(() => {
        nock.cleanAll();
    });

    it('returns empty array if chain id is not specified', async () => {
        const result = await StorageProxy.tokens.fetchTokens();
        assert.deepEqual(result, []);
    });

    it('fetches tokens from given chain', async () => {
        nock(`${storageAddress}`)
            .get('/tokens/42')
            .reply(200, tokens);

        const result = await StorageProxy.tokens.fetchTokens('42');
        assert.deepEqual(result, tokens);
    });

    it('tokens are cached after first fetch', async () => {
        nock(`${storageAddress}`)
            .get('/tokens/42')
            .once()
            .reply(200, tokens);

        await StorageProxy.tokens.fetchTokens('42');
        await StorageProxy.tokens.fetchTokens('42');
        await StorageProxy.tokens.fetchTokens('42');
    });
});
