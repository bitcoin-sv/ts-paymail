import PaymailClient from '../../../dist/cjs/src/client/paymailClient.js';
import HttpClient from '../../../dist/cjs/src/client/httpClient.js';
import fetch from 'node-fetch';

describe('#PaymailClient - Public Profile', () => {
    let paymailClient: PaymailClient;

    beforeAll(() => {
        paymailClient = new PaymailClient(new HttpClient(fetch));
    });

    it('should get Public profile for paymail', async () => {
        const publicProfile = await paymailClient.getPublicProfile('brandonbryant@handcash.io');
        expect(publicProfile).toHaveProperty('name');
        expect(publicProfile).toHaveProperty('avatar');
    });
});
