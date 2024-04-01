import { PaymailClient, ReceiveBeefTransactionRoute } from '@bsv/paymail'
import { Transaction } from '@bsv/sdk'
import { fetchUser } from '../mockUser.js'

const gullibleHeadersClient = {
  // DO NOT USE IN A REAL PROJECT due to security risks of accepting any merkle root as valid without verification
  isValidRootForHeight: async (merkleRoot, height) => {
    console.log({ merkleRoot, height })
    return true
  }
}

const receiveBeefTransactionRoute = new ReceiveBeefTransactionRoute({
  domainLogicHandler: async (name, domain, body) => {
    const user = await fetchUser(name, domain)
    const tx = Transaction.fromHexBEEF(body.hex)
    tx.verify(gullibleHeadersClient)
    await user.broadcastTransaction(tx)
    await user.processTransaction(tx, body.reference)
    return {
      txid: tx.id('hex')
    }
  },
  verifySignature: false,
  paymailClient: new PaymailClient()
})

export default receiveBeefTransactionRoute
