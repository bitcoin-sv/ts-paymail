import { RequestHandler } from 'express'
import { Transaction, Signature, PublicKey } from '@bsv/sdk';
import Joi from 'joi';

import PaymailRoute from './paymailRoute.js'
import P2pReceiveBeefTransactionCapability from '../../capability/p2pReceiveBeefTransactionCapability.js';
import { PaymailBadRequestError } from '../../errors/index.js';
import { PaymailClient } from 'mod.js';


interface ReceiveTransactionResponse {
  txid: string
  note?: string
}

export default class ReceiveBeefTransactionRoute extends PaymailRoute {
  private readonly verifySignature: boolean
  private readonly paymailClient: PaymailClient

  constructor (domainLogicHandler: RequestHandler, validateSignature = false, paymailClient: PaymailClient, endpoint = '/receive-beef-transaction/:paymail') {
    super(P2pReceiveBeefTransactionCapability, endpoint, domainLogicHandler)
    this.verifySignature = validateSignature
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
        beef: Joi.string().required(),
        metadata: this.verifySignature ? metadataSchema.required() : metadataSchema,
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
      if (this.verifySignature) {
        const { sender, pubkey, signature } = value.metadata
        const { match } = await this.paymailClient.verifyPublicKey(sender, pubkey).catch((error) => {
          throw new PaymailBadRequestError('Unable to verify public key')
        });
        if (!match) {
          throw new PaymailBadRequestError('Invalid Public Key for sender')
        }
        try {
          const tx = Transaction.fromHexBEEF(body.beef)
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
      note: domainLogicResponse.note || '',
    })
  }
}
