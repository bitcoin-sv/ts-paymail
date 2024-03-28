import express from 'express'
import { PaymailRouter } from '../../../dist/cjs/src/paymailRouter/index.js';
import publicProfileRoute from './server/publicProfile.js'
import pkiRoute from './server/pki.js'
import p2pDestinationsRoute from './server/p2pDestinations.js'
import receiveTransactionRoute from './server/receiveTransaction.js'
import { mockUser2 } from './mockUser.js'

const app = express()

const baseUrl = 'http://localhost:3000'

const routes = [publicProfileRoute, pkiRoute, p2pDestinationsRoute, receiveTransactionRoute]

const paymailRouter = new PaymailRouter({ baseUrl, routes })

app.use(paymailRouter.getRouter())

function requestResponseLogger (req, res, next) {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`)
  const originalSend = res.send
  res.send = function (data) {
    console.log(`Outgoing Response: ${res.statusCode}`)
    console.log(`Response Body: ${data}`)
    return originalSend.apply(res, arguments)
  }
  next()
}

app.use(requestResponseLogger)

const PORT = 3000
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  await mockUser2.initWallet()
  setInterval(async () => {
    console.log('mock user 2 balance', await mockUser2.getSatoshiBalance())
  }, 5000)

  setInterval(async () => {
    console.log('mock user 2 balance', await mockUser2.getSatoshiBalance())
    console.log('closing wallet')
    await mockUser2.closeWallet()
    console.log('mock user 2 balance', await mockUser2.getSatoshiBalance())
  }, 60000)
})
