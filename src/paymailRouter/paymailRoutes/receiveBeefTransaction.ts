import { RequestHandler } from 'express'
import { Transaction } from '@bsv/sdk';
import Joi from 'joi';

import PaymailRoute from './paymailRoute.js'
import P2pReceiveBeefTransactionCapability from '../../capability/p2pReceiveBeefTransactionCapability.js';
import { PaymailBadRequestError } from '../../errors/index.js';


interface ReceiveTransactionResponse {
  txid: string
  note?: string
}

export default class ReceiveBeefTransactionRoute extends PaymailRoute {
  constructor (domainLogicHandler: RequestHandler, endpoint = '/receive-beef-transaction/:paymail') {
    super(P2pReceiveBeefTransactionCapability, endpoint, domainLogicHandler)
  }

  protected getBodyValidator (): (body: any) => any {
    return (body: any) => {
      const schema = Joi.object({
        beef: Joi.string().required(),
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
        Transaction.fromHexBEEF(body.beef)
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
      note: domainLogicResponse.note || '',
    })
  }
}
