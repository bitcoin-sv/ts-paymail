import express from 'express';
import PaymailRouter from '../../dist/cjs/src/router/router.js';
import PublicProfileRoute from '../../dist/cjs/src/router/routes/publicProfileRoute.js';
import PaymailClient from '../../dist/cjs/src/client/paymailClient.js';
import httpClient from '../../dist/cjs/src/client/httpClient.js';
import { mockUser1 } from '../../dist/cjs/examples/mockUser.js';

describe('#Paymail Server - End to end test with PaymailClient and Server', () => {
  let app;
  let client: PaymailClient;
  let server;

  beforeAll((done) => {
    app = express();
    const baseUrl = 'http://localhost:3000';

    const publicProfileRoute = new PublicProfileRoute((name, domain) => {
      if (name === mockUser1.getAlias()) {
          return {
              name: mockUser1.getAlias(),
              domain,
              avatar: mockUser1.getAvatarUrl()
          }
      }
      throw new Error('User not found')
  })
  const routes = [publicProfileRoute];
    const paymailRouter = new PaymailRouter(baseUrl, routes);
    app.use(paymailRouter.getRouter());
    server = app.listen(3000, done);
    client = new PaymailClient(new httpClient(fetch));
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should get capabilities', async () => {
    const capabilities = await client.getDomainCapabilities('localhost');
    expect(capabilities).toHaveProperty('f12f968c92d6');
    expect(capabilities['6745385c3fc0']).toEqual(false);
  });

  it('should get public profile for user paymail', async () => {
    const publicProfile = await client.getPublicProfile(mockUser1.getAlias() + '@localhost');
    expect(publicProfile.name).toEqual('satoshi');
    expect(publicProfile.avatar).toEqual(mockUser1.getAvatarUrl());
  });
});