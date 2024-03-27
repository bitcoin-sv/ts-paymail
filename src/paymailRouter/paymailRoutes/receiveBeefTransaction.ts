import { RequestHandler } from 'express';
import { Transaction, Signature, PublicKey } from '@bsv/sdk';
import Joi from 'joi';
import PaymailRoute from './paymailRoute.js';
import P2pReceiveBeefTransactionCapability from '../../capability/p2pReceiveBeefTransactionCapability.js';
import { PaymailBadRequestError } from '../../errors/index.js';
import PaymailClient from '../../paymailClient/paymailClient.js';

interface ReceiveTransactionResponse {
  txid: string;
  note?: string;
}

interface ReceiveBeefTransactionRouteConfig {
  domainLogicHandler: RequestHandler;
  verifySignature?: boolean;
  paymailClient: PaymailClient;
  endpoint?: string;
}

export default class ReceiveBeefTransactionRoute extends PaymailRoute {
  private readonly verifySignature: boolean;
  private readonly paymailClient: PaymailClient;

  constructor(config: ReceiveBeefTransactionRouteConfig) {
    const {
      domainLogicHandler,
      verifySignature = false,
      paymailClient,
      endpoint = '/receive-beef-transaction/:paymail',
    } = config;
    super(P2pReceiveBeefTransactionCapability, endpoint, domainLogicHandler);
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
      await this.validateBeefTransaction(value);
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
      beef: Joi.string().required(),
      metadata: this.verifySignature ? metadataSchema.required() : metadataSchema,
      reference: Joi.string().required(),
    });
  }

  private async validateBeefTransaction(value: any) {
    try {
      Transaction.fromHexBEEF(value.beef);
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
    try {
      const { match } = await this.paymailClient.verifyPublicKey(sender, pubkey);
      if (!match) {
        throw new Error('Invalid Public Key for sender');
      }
      const tx = Transaction.fromHexBEEF(value.beef);
      const txid = tx.id('hex');
      const sig = Signature.fromDER(signature, 'hex');
      if (!sig.verify(txid, PublicKey.fromString(pubkey))) {
        throw new Error('Invalid Signature');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  protected serializeResponse(domainLogicResponse: ReceiveTransactionResponse): string {
    return JSON.stringify({
      txid: domainLogicResponse.txid,
      note: domainLogicResponse.note || '',
    });
  }
}
