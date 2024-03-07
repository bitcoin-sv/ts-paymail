import request from 'supertest';
import express from 'express';
import PaymailRouter from '../../dist/cjs/src/router/router.js';
import { PublicKeyInfrastructureRoute } from '../../dist/cjs/src/router/routes/pki.js';
import { PrivateKey } from '@bsv/sdk';


describe('#Paymail Server - PKI', () => {
  let app;
  let userIdentityKey = PrivateKey.fromRandom();

  beforeAll(() => {
    app = express();
    const baseUrl = 'http://localhost:3000';
    const routes = [
      new PublicKeyInfrastructureRoute((name, domain) => {
        return  {
          handle: `${name}@${domain}`,
          pubkey: userIdentityKey.toPublicKey().toString(),
        };
      }),
    ];
    const paymailRouter = new PaymailRouter(baseUrl, routes);
    app.use(paymailRouter.getRouter());
  });

  it('should get identity key for user', async () => {
    const response = await request(app).get('/id/satoshi@bsv.org').send();
    expect(response.statusCode).toBe(200);
    expect(response.body.handle).toEqual('satoshi@bsv.org');
    expect(response.body.pubkey).toEqual(userIdentityKey.toPublicKey().toString());
  });
});