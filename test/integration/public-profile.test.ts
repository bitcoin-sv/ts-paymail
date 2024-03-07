import request from 'supertest';
import express from 'express';
import PaymailRouter from '../../dist/cjs/src/router/router.js';
import { PublicProfileRoute } from '../../dist/cjs/src/router/routes/publicProfileRoute.js';

describe('#Paymail Server - Get Public Profile', () => {
  let app;

  beforeAll(() => {
    app = express();
    const baseUrl = 'http://localhost:3000';
    const routes = [
      new PublicProfileRoute((name, domain) => {
        return { name, domain, avatarUrl: `https://avatar.com/${name}@${domain}` };
      }),
    ];
    const paymailRouter = new PaymailRouter(baseUrl, routes);
    app.use(paymailRouter.getRouter());
  });

  it('should get public profile for user paymail', async () => {
    const response = await request(app).get('/public-profile/satoshi@bsv.org');
    expect(response.statusCode).toBe(200);
    expect(response.body.avatarUrl).toEqual('https://avatar.com/satoshi@bsv.org');
    expect(response.body.name).toEqual('satoshi');
  });
});