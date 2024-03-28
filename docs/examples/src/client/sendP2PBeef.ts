import { PaymailClient } from '../../../../dist/cjs/src/paymailClient/index.js';
import { mockUser1, mockUser2 } from '../mockUser.js'

const client = new PaymailClient();

(async () => {
  const sender = mockUser1
  const receiver = mockUser2
  await sender.initWallet()
  console.log('sender balance', await sender.getSatoshiBalance())

  const p2pDestination = await client.getP2pPaymentDestination(receiver.getPaymail(), 10)

  // example we are assuming only one output but in reality it can be many
  const { tx, reference } = await sender.getSpendingTransactionToScript(p2pDestination.outputs[0].script, 10)

  await client.sendBeefTransactionP2P(receiver.getPaymail(), tx.toHexBEEF(), p2pDestination.reference,
    {
      sender: sender.getPaymail(),
      pubkey: sender.getIdentityKey(),
      signature: client.createP2PSignature(tx.id('hex') as string, sender.getIdentityPrivateKey()),
      note: 'hello world'
    })
  await sender.broadcastTransaction(tx)
  mockUser1.processTransaction(tx, reference)
  console.log('sender balance', await sender.getSatoshiBalance())
  await sender.closeWallet()
})()
