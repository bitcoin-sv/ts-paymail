import { RequestHandler } from 'express'
import Joi from 'joi'
import { Transaction } from '@bsv/sdk'
import PaymailRoute from './paymailRoute.js'
import P2pReceiveTransactionCapability from '../../capability/p2pReceiveTransactionCapability.js'
import { PaymailBadRequestError } from '../../errors/index.js'

interface ReceiveTransactionResponse {
  txid: string
  note?: string
}

export default class ReceiveTransactionRoute extends PaymailRoute {
  constructor (domainLogicHandler: RequestHandler, endpoint = '/receive-transaction/:paymail') {
    super(P2pReceiveTransactionCapability, endpoint, domainLogicHandler)
  }

  protected getBodyValidator (): (body: any) => any {
    return (body: any) => {
      const schema = Joi.object({
        hex: Joi.string().required(),
        metadata: Joi.object({
          sender: Joi.string(),
          pubkey: Joi.string(),
          signature: Joi.string(),
          note: Joi.string().optional(),
        }).optional(),
        reference: Joi.string().required(),
      });
      const { error, value } = schema.validate(body);
      if (error) {
        throw new PaymailBadRequestError(error.message);
      }
      try {
        Transaction.fromHex(body.hex)
      } catch (error) {
        throw new PaymailBadRequestError('Invalid body: ' + error.message)
      }
      return value;
  }
}

  ReceiveTransactionResponse
  protected serializeResponse (domainLogicResponse: ReceiveTransactionResponse): string {
    return JSON.stringify({
      txid: domainLogicResponse.txid,
      note: domainLogicResponse.note || ''
    })
  }
}
