import { PaymailClient } from '../../src/paymailClient/index.js'
import { mockUser1, mockUser2 } from './mockUser'

const client = new PaymailClient();

(async () => {
  await mockUser1.initWallet()
  console.log('Client balance', await mockUser1.getSatoshiBalance())
  const senderPaymail = mockUser1.getAlias() + '@localhost'
  const receiverPaymail = mockUser2.getAlias() + '@localhost'
  // const publicProfile = await client.getPublicProfile(receiverPaymail)
  // // console.log(publicProfile)

  // // const pki = await client.getPki(paymail);
  // // console.log(pki)

  const p2pDestination = await client.getP2pPaymentDestination(receiverPaymail, 10)
  const { tx, reference } = await mockUser1.getSpendingTransactionToScript(p2pDestination.outputs[0].script, 10)

  const p2pBroadcastResult = await client.sendTransactionP2P(receiverPaymail, tx.toHex(), p2pDestination.reference,
    {
      sender: senderPaymail,
      pubkey: mockUser1.getIdentityKey(),
      signature: '',
      note: 'hello world',
    });
  console.log(p2pBroadcastResult);
  await mockUser1.broadcastTransaction(tx);
  mockUser1.processTransaction(tx, reference);
  console.log('Client balance', await mockUser1.getSatoshiBalance());
  await mockUser1.closeWallet();
})()


