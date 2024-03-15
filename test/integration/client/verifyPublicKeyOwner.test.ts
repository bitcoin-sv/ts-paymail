import PaymailClient from '../../../dist/cjs/src/client/paymailClient.js';

describe('#PaymailClient - Verify Public Key Owner', () => {
    let paymailClient;

    beforeAll(() => {
        paymailClient = new PaymailClient();
    });

    it('should verify the public key owner', async () => {
        const paymail = 'brandonbryant@handcash.io';
        const result = await paymailClient.verifyPublicKey(paymail, 'random key');
        console.log(result);
    });
});
 