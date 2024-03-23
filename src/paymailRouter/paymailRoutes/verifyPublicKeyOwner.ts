import PaymailRoute from './paymailRoute.js';
import { RequestHandler } from 'express';
import VerifyPublicKeyOwnerCapability from 'src/capability/verifyPublicKeyOwnerCapability.js';

interface VerifyPublicKeyOwnerResponse {
    handle: string;
    pubkey: string;
    match: boolean;
}

export default class VerifyPublicKeyOwnerRoute extends PaymailRoute  {
    constructor(domainLogicHandler: RequestHandler, endpoint = '/verifypubkey/:paymail/:pubkey') {
        super(VerifyPublicKeyOwnerCapability, endpoint, domainLogicHandler);
    }
    
    protected serializeResponse(domainLogicResponse: VerifyPublicKeyOwnerResponse): string {
        return JSON.stringify({
            bsvalias: '1.0',
            "handle": domainLogicResponse.handle,
            "pubkey": domainLogicResponse.pubkey,
            "match": domainLogicResponse.match
        });
    }
}
