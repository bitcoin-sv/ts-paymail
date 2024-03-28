import { PaymailClient } from '../../../../dist/cjs/src/paymailClient/index.js';
import { ReceiveTransactionRoute } from '../../../../dist/cjs/src/paymailRouter/index.js';
import { fetchUser } from '../mockUser.js'
import { Transaction } from '@bsv/sdk'

const receiveTransactionRoute = new ReceiveTransactionRoute({
  domainLogicHandler: async (name, domain, body) => {
    const user = await fetchUser(name, domain)
    const tx = Transaction.fromHex(body.hex)
    await user.broadcastTransaction(tx)
    await user.processTransaction(tx, body.reference)
    return {
      txid: tx.id('hex')
    }
  },
  verifySignature: true,
  paymailClient: new PaymailClient()
})

export default receiveTransactionRoute
