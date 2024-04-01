import { PaymailClient } from '@bsv/paymail'
import { mockUser1 } from '../mockUser'

const client = new PaymailClient();

(async () => {
  const sender = mockUser1
  const receiver = 'brandonbryant@handcash.io'
  await sender.initWallet()
  console.log('sender balance', await sender.getSatoshiBalance())

  const p2pDestination = await client.getP2pPaymentDestination(receiver, 10)

  // example we are assuming only one output but in reality it can be many
  const { tx, reference } = await sender.getSpendingTransactionToScript(p2pDestination.outputs[0].script, 10)

  await client.sendTransactionP2P(receiver, tx.toHex(), p2pDestination.reference,
    {
      sender: sender.getPaymail(),
      pubkey: sender.getIdentityKey(),
      // @ts-expect-error
      signature: client.createP2PSignature(tx.id('hex') as string, sender.getIdentityPrivateKey()),
      note: 'hello world'
    })
  await sender.broadcastTransaction(tx)
  mockUser1.processTransaction(tx, reference)
  console.log('sender balance', await sender.getSatoshiBalance())
  await sender.closeWallet()
})()
