import PaymailClient from '../../../dist/cjs/src/client/paymailClient.js';

describe('#PaymailClient - Public Profile', () => {
    let paymailClient: PaymailClient;

    beforeAll(() => {
        paymailClient = new PaymailClient();
    });

    it('should get Public profile for paymail', async () => {
        const publicProfile = await paymailClient.getPublicProfile('brandonbryant@handcash.io');
        expect(publicProfile).toHaveProperty('name');
        expect(publicProfile).toHaveProperty('avatar');
    });
});
