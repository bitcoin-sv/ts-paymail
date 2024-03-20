import PaymailClient from '../../../dist/cjs/src/client/paymailClient.js';
import HttpClient from '../../../dist/cjs/src/client/httpClient.js';
import fetch from 'node-fetch';

describe('#PaymailClient - Capability Discovery', () => {
    let paymailClient: PaymailClient;

    beforeAll(() => {
        paymailClient = new PaymailClient(new HttpClient(fetch));
    });

    it('should get capabilities for paymail', async () => {
        const capabilities = await paymailClient.getDomainCapabilities('handcash.io');
        expect(capabilities).toHaveProperty('pki');
    });

    it('should get capabilities for paymail', async () => {
        const capabilities = await paymailClient.getDomainCapabilities('tkz.id');
        expect(capabilities).toHaveProperty('pki');
    });
});
