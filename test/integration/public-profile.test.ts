import request from 'supertest';
import express from 'express';
import PaymailRouter from '../../dist/cjs/src/router/router.js';
import { PublicProfileCapability } from '../../dist/cjs/src/router/capability/publicProfileCapability.js';

describe('#Paymail Server - Get Public Profile', () => {
  let app;

  beforeAll(() => {
    app = express();
    const baseUrl = 'http://localhost:3000';
    const capabilities = [
      new PublicProfileCapability((name, domain) => {
        console.log('1')
        return { name, domain, avatarUrl: `https://avatar.com/${name}@${domain}` };
      }),
    ];
    const paymailRouter = new PaymailRouter(baseUrl, capabilities);
    app.use(paymailRouter.getRouter());
  });

  it('should get public profile for user paymail', async () => {
    const response = await request(app).get('/public-profile/satoshi@bsv.org');
    expect(response.statusCode).toBe(200);
    console.log(typeof response.body)
    expect(response.body.avatarUrl).toEqual('https://avatar.com/satoshi@bsv.org');
    expect(response.body.name).toEqual('satoshi');
  });
});