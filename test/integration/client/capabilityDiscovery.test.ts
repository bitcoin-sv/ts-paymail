import PaymailClient from '../../../dist/cjs/src/client/paymailClient.js';

describe('#PaymailClient - Capability Discovery', () => {
    let paymailClient: PaymailClient;

    beforeAll(() => {
        paymailClient = new PaymailClient();
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
