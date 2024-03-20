import PaymailClient from '../../../dist/cjs/src/client/paymailClient.js';
import HttpClient from '../../../dist/cjs/src/client/httpClient.js';
import fetch from 'node-fetch';

describe('#PaymailClient - Verify Public Key Owner', () => {
    let paymailClient;

    beforeAll(() => {
        paymailClient = new PaymailClient(new HttpClient(fetch));
    });

    it('should verify the public key owner', async () => {
        const paymail = 'brandonbryant@handcash.io';
        const result = await paymailClient.verifyPublicKey(paymail, 'random key');
        console.log(result);
    });
});
 