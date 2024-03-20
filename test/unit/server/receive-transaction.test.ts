import request from 'supertest';
import express from 'express';
import PaymailRouter from '../../../dist/cjs/src/router/router.js';
import ReceiveTransactionRoute from '../../../dist/cjs/src/router/routes/receiveTransaction.js';

describe('#Paymail Server - P2P Receive Transaction', () => {
  let app;

  beforeAll(() => {
    app = express();
    const baseUrl = 'http://localhost:3000';
    const routes = [
      new ReceiveTransactionRoute((name, domain, body) => {
        return  {
          txid: '5878f6efcb1aa3be389510ae2ff10d0368976bf867e8442b751908f19024f8dd',
        };
      }),
    ];
    const paymailRouter = new PaymailRouter(baseUrl, routes);
    app.use(paymailRouter.getRouter());
  });

  it('should receive transaction', async () => {
    const response = await request(app).post('/receive-transaction/satoshi@bsv.org').send({
      "hex": "01000000012adda020db81f2155ebba69e7c841275517ebf91674268c32ff2f5c7e2853b2c010000006b483045022100872051ef0b6c47714130c12a067db4f38b988bfc22fe270731c2146f5229386b02207abf68bbf092ec03e2c616defcc4c868ad1fc3cdbffb34bcedfab391a1274f3e412102affe8c91d0a61235a3d07b1903476a2e2f7a90451b2ed592fea9937696a07077ffffffff02ed1a0000000000001976a91491b3753cf827f139d2dc654ce36f05331138ddb588acc9670300000000001976a914da036233873cc6489ff65a0185e207d243b5154888ac00000000",
      "metadata": {
        "sender": "halfinny@vistamail.org",
        "pubkey": "02d362a22ddc1a299122455690bec54397ae0b1b2765e4f1687cb479271c050a40",
        "signature": "signature(txid)",
        "note": "gm."
      },
      "reference": "someRefId"
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.txid).toEqual('5878f6efcb1aa3be389510ae2ff10d0368976bf867e8442b751908f19024f8dd');
  });
});