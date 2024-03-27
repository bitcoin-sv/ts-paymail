import { RequestHandler } from 'express'
import Joi from 'joi'
import { PublicKey, Transaction } from '@bsv/sdk'
import PaymailRoute from './paymailRoute.js'
import P2pReceiveTransactionCapability from '../../capability/p2pReceiveTransactionCapability.js'
import { PaymailBadRequestError } from '../../errors/index.js'
import PaymailClient from '../../paymailClient/paymailClient.js'

import { Signature } from '@bsv/sdk';

interface ReceiveTransactionResponse {
  txid: string
  note?: string
}

export default class ReceiveTransactionRoute extends PaymailRoute {
  private readonly verifySignature: boolean
  private readonly paymailClient: PaymailClient
  
  constructor (domainLogicHandler: RequestHandler, verifySignature = false, paymailClient: PaymailClient, endpoint = '/receive-transaction/:paymail') {
    super(P2pReceiveTransactionCapability, endpoint, domainLogicHandler)
    this.verifySignature = verifySignature
    this.paymailClient = paymailClient
  }

  protected getBodyValidator (): (body: any) => any {
    return async (body: any) => {
      const metadataSchema = Joi.object({
        sender: this.verifySignature ? Joi.string().required() : Joi.string().allow('').optional(),
        pubkey: this.verifySignature ? Joi.string().required() : Joi.string().allow('').optional(),
        signature: this.verifySignature ? Joi.string().required() : Joi.string().allow('').optional(),
        note: Joi.string().allow('').optional(),
      });
      const schema = Joi.object({
        hex: Joi.string().required(),
        metadata: this.verifySignature ? metadataSchema.required() : metadataSchema,
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
      if (this.verifySignature) {
        const { sender, pubkey, signature } = value.metadata
        const { match } = await this.paymailClient.verifyPublicKey(sender, pubkey)
        if (!match) {
          throw new PaymailBadRequestError('Invalid Public Key for sender')
        }
        try {
          const tx = Transaction.fromHex(body.hex)
          const txid = tx.id('hex');
          const sig = Signature.fromDER(signature, 'hex');
          if(!sig.verify(txid, PublicKey.fromString(pubkey))){
            throw new PaymailBadRequestError('Invalid Signature');
          };
        } catch (error) {
          throw new PaymailBadRequestError('Invalid Signature');
        }
        
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
