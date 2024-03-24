import PaymailRoute from './paymailRoute.js'
import { RequestHandler } from 'express'
import P2pReceiveTransactionCapability from '../../capability/p2pReceiveTransactionCapability.js'

interface ReceiveTransactionResponse {
  txid: string
}

export default class ReceiveTransactionRoute extends PaymailRoute {
  constructor (domainLogicHandler: RequestHandler, endpoint = '/receive-transaction/:paymail') {
    super(P2pReceiveTransactionCapability, endpoint, domainLogicHandler)
  }

  ReceiveTransactionResponse
  protected serializeResponse (domainLogicResponse: ReceiveTransactionResponse): string {
    return JSON.stringify({
      txid: domainLogicResponse.txid
    })
  }
}
