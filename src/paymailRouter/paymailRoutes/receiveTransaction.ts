import { RequestHandler } from 'express';
import Joi from 'joi';
import { PublicKey, Transaction, Signature } from '@bsv/sdk';
import PaymailRoute from './paymailRoute.js';
import P2pReceiveTransactionCapability from '../../capability/p2pReceiveTransactionCapability.js';
import { PaymailBadRequestError } from '../../errors/index.js';
import PaymailClient from '../../paymailClient/paymailClient.js';

interface ReceiveTransactionResponse {
  txid: string;
  note?: string;
}

interface ReceiveTransactionRouteConfig {
  domainLogicHandler: RequestHandler;
  verifySignature?: boolean;
  paymailClient: PaymailClient;
  endpoint?: string;
}

export default class ReceiveTransactionRoute extends PaymailRoute {
  private readonly verifySignature: boolean;
  private readonly paymailClient: PaymailClient;

  constructor(config: ReceiveTransactionRouteConfig) {
    const {
      domainLogicHandler,
      verifySignature = false,
      paymailClient,
      endpoint = '/receive-transaction/:paymail',
    } = config;

    super(P2pReceiveTransactionCapability, endpoint, domainLogicHandler);
    this.verifySignature = verifySignature;
    this.paymailClient = paymailClient;
  }

  protected getBodyValidator(): (body: any) => any {
    return async (body: any) => {
      const schema = this.buildSchema();
      const { error, value } = schema.validate(body);
      if (error) {
        throw new PaymailBadRequestError(error.message);
      }
      await this.validateTransaction(value);
      return value;
    };
  }

  private buildSchema() {
    const metadataSchema = Joi.object({
      sender: this.verifySignature ? Joi.string().required() : Joi.string().allow('').optional(),
      pubkey: this.verifySignature ? Joi.string().required() : Joi.string().allow('').optional(),
      signature: this.verifySignature ? Joi.string().required() : Joi.string().allow('').optional(),
      note: Joi.string().allow('').optional(),
    });
    return Joi.object({
      hex: Joi.string().required(),
      metadata: this.verifySignature ? metadataSchema.required() : metadataSchema,
      reference: Joi.string().required(),
    });
  }

  private async validateTransaction(value: any) {
    try {
      Transaction.fromHex(value.hex);
    } catch (error) {
      throw new PaymailBadRequestError('Invalid body: ' + error.message);
    }
    if (this.verifySignature) {
      await this.validateSignature(value).catch((error) => {
        throw new PaymailBadRequestError(error.message);
      });
    }
  }

  private async validateSignature(value: any) {
    const { sender, pubkey, signature } = value.metadata;
    const { match } = await this.paymailClient.verifyPublicKey(sender, pubkey);
    if (!match) {
      throw new Error('Invalid Public Key for sender');
    }

    const tx = Transaction.fromHex(value.hex);
    const txid = tx.id('hex');
    const sig = Signature.fromDER(signature, 'hex');
    if (!sig.verify(txid, PublicKey.fromString(pubkey))) {
      throw new Error('Invalid Signature');
    }
  }

  protected serializeResponse(domainLogicResponse: ReceiveTransactionResponse): string {
    return JSON.stringify({
      txid: domainLogicResponse.txid,
      note: domainLogicResponse.note || '',
    });
  }
}
