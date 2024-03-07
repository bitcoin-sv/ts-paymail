import PaymailRoute from './route.js';
import { RequestHandler } from 'express';
import { ReceiveTransactionCapability } from '../../capabilityDefinition/capabilityDefinition.js';


interface ReceiveTransactionResponse {
    txid: string;
}

export class ReceiveTransactionRoute extends PaymailRoute  {
    constructor(domainLogicHandler: RequestHandler, endpoint = '/receive-transaction/:paymail') {
        super(ReceiveTransactionCapability, endpoint, 'POST', domainLogicHandler);
    }
    ReceiveTransactionResponse
    protected serializeResponse(domainLogicResponse: ReceiveTransactionResponse): string {
        return JSON.stringify({
            txid: domainLogicResponse.txid,
        });
    }
}
