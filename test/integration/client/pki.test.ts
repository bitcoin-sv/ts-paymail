import PaymailClient from '../../../dist/cjs/src/client/paymailClient.js';
import HttpClient from '../../../dist/cjs/src/client/httpClient.js';

describe('#PaymailClient - Public Key Infrastructure', () => {
    let paymailClient;

    beforeAll(() => {
        paymailClient = new PaymailClient(new HttpClient(fetch));
    });

    it('should retrieve the public key for a given paymail handle', async () => {
        const paymail = 'brandonbryant@handcash.io';
        const publicKeyInfo = await paymailClient.getPki(paymail);
        expect(publicKeyInfo).toHaveProperty('bsvalias');
        expect(publicKeyInfo.bsvalias).toBe('1.0');
        expect(publicKeyInfo).toHaveProperty('handle');
        expect(publicKeyInfo.handle).toBe(paymail);
        expect(publicKeyInfo).toHaveProperty('pubkey');
        expect(publicKeyInfo.pubkey).toMatch(/^(02|03)[a-fA-F0-9]{64}$/);
    });
});
 