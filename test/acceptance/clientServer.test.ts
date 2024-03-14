import express from 'express';
import PaymailRouter from '../../dist/cjs/src/router/router.js';
import { PublicProfileRoute } from '../../dist/cjs/src/router/routes/publicProfileRoute.js';
import PaymailClient from '../../dist/cjs/src/client/paymailClient.js';

describe('#Paymail Server - End to end test with PaymailClient and Server', () => {
  let app;
  let client: PaymailClient;
  let server;

  beforeAll((done) => {
    app = express();
    const baseUrl = 'http://localhost:3000';
    const capabilities = [
      new PublicProfileRoute((name, domain) => {
        return { name, domain, avatarUrl: `https://avatar.com/${name}@${domain}` };
      }),
    ];
    const paymailRouter = new PaymailRouter(baseUrl, capabilities, undefined, true);
    app.use(paymailRouter.getRouter());
    server = app.listen(3000, done);
    client = new PaymailClient();
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should get capabilities', async () => {
    const response = await client.getDomainCapabilities('localhost');
    expect(response.bsvalias).toBe('1.0');
    expect(response.capabilities).toHaveProperty('f12f968c92d6');
    expect(response.capabilities['6745385c3fc0']).toEqual(true);
  });
});