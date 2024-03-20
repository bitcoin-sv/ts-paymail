import request from 'supertest';
import express from 'express';
import PaymailRouter from '../../../dist/cjs/src/router/router.js';
import PublicProfileRoute from '../../../dist/cjs/src/router/routes/publicProfileRoute.js';

describe('#Paymail Server - Capability discovery', () => {
  let app;

  beforeAll(() => {
    app = express();
    const baseUrl = 'http://localhost:3000';
    const capabilities = [
      new PublicProfileRoute((name, domain) => {
        return { name, domain, avatarUrl: `https://avatar.com/${name}@${domain}` };
      }),
    ];
    const paymailRouter = new PaymailRouter(baseUrl, capabilities, undefined, true);
    app.use(paymailRouter.getRouter());
  });

  it('should get capabilities', async () => {
    const response = await request(app).get('/.well-known/bsvalias');
    expect(response.statusCode).toBe(200);
    expect(response.body.bsvalias).toBe('1.0');
    expect(response.body.capabilities).toHaveProperty('f12f968c92d6');
    expect(response.body.capabilities['6745385c3fc0']).toEqual(true);
  });
});

